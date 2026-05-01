const LoadingSkeleton = ({ count = 3, height = 'h-16' }) => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`w-full ${height} bg-[#111] rounded-lg animate-pulse`}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
