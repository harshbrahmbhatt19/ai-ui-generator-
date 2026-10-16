import { NextResponse } from 'next/server';
import { generateText } from 'ai'; 
import { createOpenAI } from '@ai-sdk/openai';
import { PLANNER_SYSTEM_PROMPT, GENERATOR_SYSTEM_PROMPT, EXPLAINER_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { cleanGeneratedCode, validateJSX } from '@/lib/utils/validation';

// Setup Groq provider
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});
const model = groq(process.env.GROQ_MODEL || 'openai/gpt-oss-120b');

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is missing. Add it to .env.local and restart the dev server.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const prompt: string = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const currentCode: string = typeof body?.currentCode === 'string' ? body.currentCode : '';

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    console.log("Request received. Prompt:", prompt);

    const plannerContext = `User Request: ${prompt}\nCurrent UI Code: ${currentCode || 'None'}`;
    
    // planner 
    const { text: planText } = await generateText({
      model,
      system: PLANNER_SYSTEM_PROMPT + "\n\nCRITICAL: Output ONLY valid JSON. Do not use Markdown blocks.",
      prompt: plannerContext,
    });
    
    let plan;
    try {
      const cleanJson = planText.replace(/```json/g, '').replace(/```/g, '').trim();
      plan = JSON.parse(cleanJson);
      console.log("2. Planner finished:", plan);
    } catch {
      console.error("Failed to parse Plan JSON. Using fallback.");
      plan = { 
        intent_summary: "User requested UI changes.", 
        components_used: ["Container"], 
        layout_strategy: "Standard Layout" 
      };
    }

    //GENERATOR
    const generatorContext = `User Request: ${prompt}\nUI Plan to follow: ${JSON.stringify(plan)}\nCurrent UI Code (modify this if present, keep unrelated parts unchanged): ${currentCode || 'None'}\nOutput the complete updated UI.`;
    
    const { text: rawJSX } = await generateText({
      model,
      system: GENERATOR_SYSTEM_PROMPT,
      prompt: generatorContext,
    });
    console.log("Generator finished");

    
    let cleanedCode = cleanGeneratedCode(rawJSX);

    if (!cleanedCode.trim().startsWith('<>')) {
      cleanedCode = `<>\n${cleanedCode}\n</>`;
    }

    // Auto-fix common HTML tags and chart data patterns.
    // NOTE: patterns are case-SENSITIVE (lowercase HTML only) so that allowed
    // components such as <Button variant="secondary"> are never rewritten.
    const OPEN = (tags: string) => new RegExp(`<(?:${tags})(?:\\s[^>]*?)?(\\/?)>`, 'g');
    const CLOSE = (tags: string) => new RegExp(`</(?:${tags})>`, 'g');
    cleanedCode = cleanedCode
      .replace(OPEN('div|main|section|header|footer|p|span|h[1-6]|ul|ol|li|form'), '<Container$1>')
      .replace(CLOSE('div|main|section|header|footer|p|span|h[1-6]|ul|ol|li|form'), '</Container>')
      .replace(OPEN('button'), '<Button variant="primary"$1>')
      .replace(CLOSE('button'), '</Button>')
      .replace(/<input(?:\s[^>]*?)?\/?>/g, '<Input />')
      .replace(/<br\s*\/?>/g, '')
      .replace(/data=\{\[\]\(\)\}/g, 'data={[65, 59, 80, 81, 56, 55, 40]}')
      .replace(/data=\{\[\]\}/g, 'data={[65, 59, 80, 81, 56, 55, 40]}');

    // Validation
    const validation = validateJSX(cleanedCode);

    if (!validation.isValid) {
      console.error("Validation Error:", validation.error);
      return NextResponse.json({ 
        error: validation.error,
        code: `<><Card title="Generation Error"><Container><Button variant="destructive">Generation blocked</Button></Container></Card></>`,
        explanation: "The generated code used disallowed HTML tags."
      });
    }
    // Generate explanation for the user
    const explainerContext = `Explain this UI Plan to the user: ${JSON.stringify(plan)}`;
    
    const { text: explanation } = await generateText({
      model,
      system: EXPLAINER_SYSTEM_PROMPT,
      prompt: explainerContext,
    });

    return NextResponse.json({
      plan,
      code: cleanedCode,
      explanation
    });

  } catch (error) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: "Failed to generate UI." }, { status: 500 });
  }
}