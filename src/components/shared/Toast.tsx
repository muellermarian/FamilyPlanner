// Props for the Toast component: expects a message string to display
interface ToastProps {
  message: string;
}

type ReadonlyToastProps = Readonly<ToastProps>;

// Toast component displays a fixed notification message at the bottom of the screen
export default function Toast({ message }: ReadonlyToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}
