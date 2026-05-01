const ErrorBanner = ({ message }) => {
  return (
    <div className="flex items-center gap-2 bg-[#1a0a0a] border border-[#3a1515] rounded-md p-3 mb-4">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#cc4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p className="text-xs text-[#cc4444]">{message}</p>
    </div>
  );
};

export default ErrorBanner;
