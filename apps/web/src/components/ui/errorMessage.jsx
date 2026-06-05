export default function errorMessage({ message }) {
  if (!message) return null;

  return (
    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
      {message}
    </p>
  );
}