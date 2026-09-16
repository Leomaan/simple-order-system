export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
    </div>
  );
}

export default LoadingSpinner;
