/**
 * Builds a single self-contained HTML file from generated JSX.
 * Uses CDN React + Babel + Tailwind, with plain-JS copies of the system components.
 */
const COMPONENTS_JS = `
const { useState } = React;
const Container = ({ children, direction = 'column', align = 'start', gap = 'medium' }) => {
  const d = direction === 'row' ? 'flex-row' : 'flex-col';
  const a = { start: 'items-start', center: 'items-center', end: 'items-end' }[align] || 'items-start';
  const g = { small: 'gap-2', medium: 'gap-4', large: 'gap-8' }[gap] || 'gap-4';
  return <div className={'flex w-full ' + d + ' ' + a + ' ' + g}>{children}</div>;
};
const Button = ({ children, variant = 'primary', onClick }) => {
  const v = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  }[variant] || '';
  return <button onClick={onClick} className={'px-4 py-2 rounded-md font-medium transition-colors ' + v}>{children}</button>;
};
const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    {title && <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>}
    <div className="p-6">{children}</div>
  </div>
);
const Input = ({ type = 'text', placeholder, label }) => (
  <div className="flex flex-col gap-1.5 w-full mb-4">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input type={type} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);
const Navbar = ({ title = 'App', children }) => (
  <nav className="w-full bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md mb-6 rounded-lg">
    <div className="text-xl font-bold tracking-tight">{title}</div>
    <div className="flex gap-4 items-center">{children}</div>
  </nav>
);
const Sidebar = ({ children }) => (
  <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col p-4"><div className="space-y-2">{children}</div></aside>
);
const Modal = ({ title, isOpen = true, children, onClose }) => {
  const [dismissed, setDismissed] = useState(false);
  if (!isOpen || dismissed) return null;
  const close = () => { setDismissed(true); if (onClose) onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={close} className="text-gray-400 hover:text-gray-500">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
const Chart = ({ title, type = 'bar', data = [40, 70, 45, 90, 60] }) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pts = (Array.isArray(data) ? data : []).map(Number).filter(Number.isFinite).map(v => Math.min(100, Math.max(0, v)));
  const points = pts.length ? pts : [40, 70, 45, 90, 60];
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="text-sm font-medium text-gray-500 mb-4">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-2">
        {points.map((v, i) => (
          <div key={i} className="w-full h-full flex flex-col justify-end items-center gap-1">
            <div className={'rounded-t ' + (type === 'bar' ? 'bg-blue-500' : 'bg-indigo-400 rounded-full')} style={{ height: v + '%', width: type === 'line' ? '4px' : '100%' }} />
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-gray-100 pt-2 flex justify-between text-xs text-gray-400">
        {points.map((_, i) => <span key={i}>{labels[i % labels.length]}</span>)}
      </div>
    </div>
  );
};
const Table = ({ columns = [], rows = [] }) => {
  const cols = Array.isArray(columns) ? columns.map(String) : [];
  const data = Array.isArray(rows) ? rows.filter(Array.isArray) : [];
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm text-left text-gray-700">
        {cols.length > 0 && <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{cols.map((c, i) => <th key={i} className="px-4 py-3 font-semibold">{c}</th>)}</tr></thead>}
        <tbody className="divide-y divide-gray-100">
          {data.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-3">{String(c)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
};
`;

export function buildStandaloneHtml(code: string, title = 'Generated UI'): string {
  // Prevent a stray </script> in generated code from breaking out of the tag
  const safeCode = code.replace(/<\/script/gi, '<\\/script');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-50 p-4">
<div id="root"></div>
<script type="text/babel">
${COMPONENTS_JS}
function App() {
  return (
${safeCode}
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>
`;
}
