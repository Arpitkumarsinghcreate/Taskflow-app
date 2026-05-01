const StatusPill = ({ status }) => {
  const statusConfig = {
    todo:        { label: 'To Do',       bg: '#1a1a1a', text: '#555' },
    in_progress: { label: 'In Progress', bg: '#0d1f35', text: '#185FA5' },
    done:        { label: 'Done',        bg: '#0d2318', text: '#1D9E75' },
    overdue:     { label: 'Overdue',     bg: '#1a0a0a', text: '#cc4444' },
    active:      { label: 'Active',      bg: '#0d2318', text: '#1D9E75' },
    completed:   { label: 'Completed',   bg: '#1a2a1a', text: '#3B6D11' },
    on_hold:     { label: 'On Hold',     bg: '#2a1f0d', text: '#BA7517' },
    cancelled:   { label: 'Cancelled',   bg: '#1a0a0a', text: '#cc4444' },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
};

export default StatusPill;
