export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
}
