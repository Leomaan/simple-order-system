export default function input({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-neutral-400 text-sm">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
      />
    </div>
  );
}