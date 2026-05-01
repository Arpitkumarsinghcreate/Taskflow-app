const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 text-[#333]">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-[#f0f0f0] font-medium mb-1">{title}</h3>
      <p className="text-sm text-[#555] max-w-[260px] mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-4 py-2 rounded-md transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
