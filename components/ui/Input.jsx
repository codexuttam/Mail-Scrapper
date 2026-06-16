export function Input({ type = 'text', placeholder, value, onChange, className = '' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
    />
  );
}
