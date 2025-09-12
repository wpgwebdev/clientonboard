import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between max-w-md">
        <span>Toggle theme:</span>
        <ThemeToggle />
      </div>
    </div>
  );
}