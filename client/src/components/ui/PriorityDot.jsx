const PriorityDot = ({ priority }) => {
  const colors = { high: '#cc4444', medium: '#EF9F27', low: '#1D9E75' };
  return (
    <span
      className="w-1.5 h-1.5 rounded-full inline-block"
      style={{ backgroundColor: colors[priority] || colors.medium }}
    />
  );
};

export default PriorityDot;
