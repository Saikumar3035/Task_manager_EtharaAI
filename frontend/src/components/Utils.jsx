export function Avatar({ user, size = 28 }) {
  if (!user) return null;
  return (
    <div className="user-avatar" style={{ width: size, height: size, background: user.color, fontSize: size * 0.38 }}>
      {user.initials}
    </div>
  );
}

export function statusBadge(status) {
  const map = { todo: ["badge-gray", "To Do"], "in-progress": ["badge-blue", "In Progress"], done: ["badge-green", "Done"] };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function priorityBadge(priority) {
  const map = { high: ["badge-red", "High"], medium: ["badge-amber", "Medium"], low: ["badge-green", "Low"] };
  const [cls, label] = map[priority] || ["badge-gray", priority];
  return <span className={`badge ${cls}`}><span className={`priority-dot priority-${priority}`} />{label}</span>;
}
export function dueDateLabel(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return <span className="overdue text-sm">⚠ {Math.abs(diff)}d overdue</span>;
  if (diff === 0) return <span className="due-soon text-sm"> Due today</span>;
  if (diff <= 3) return <span className="due-soon text-sm"> {diff}d left</span>;
  return <span className="text-muted text-sm"> {dateStr}</span>;
}
export function getProjectRole(project, userId) {
  if (!project) return null;
  if (project.adminId === userId) return "admin";
  if (project.memberIds.includes(userId)) return "member";
  return null;
}