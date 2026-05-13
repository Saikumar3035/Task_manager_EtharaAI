import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { priorityBadge, dueDateLabel } from "../components/Utils";

export default function MyTasksPage() {
  const { currentUser, tasks, projects, updateTask, showToast } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const filtered = myTasks.filter(t => {
    const title = t.title || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "todo") return t.status === "todo";
    if (filter === "in-progress") return t.status === "in-progress";
    if (filter === "done") return t.status === "done";
    if (filter === "overdue") return t.dueDate && new Date(t.dueDate) < today && t.status !== "done";
    return true;
  });

  const counts = {
    all: myTasks.length,
    todo: myTasks.filter(t => t.status === "todo").length,
    "in-progress": myTasks.filter(t => t.status === "in-progress").length,
    done: myTasks.filter(t => t.status === "done").length,
    overdue: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "done").length,
  };

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">My Tasks</div>
          <div className="text-sm text-muted">{myTasks.length} tasks assigned to you</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon"><Icon.Search /></span>
          <input className="search-input" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {[["all", "All"], ["todo", "To Do"], ["in-progress", "In Progress"], ["done", "Done"], ["overdue", "⚠ Overdue"]].map(([key, label]) => (
          <button key={key} className={`filter-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
            {label} <span style={{ opacity: 0.7, fontSize: 11 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Task</th><th>Project</th><th>Priority</th><th>Status</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text3)", padding: 60 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}></div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text2)", marginBottom: 4 }}>No tasks found</div>
                  <div style={{ fontSize: 13 }}>You're all caught up!</div>
                </td></tr>
              ) : filtered.map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.description && <div className="text-sm text-muted" style={{ marginTop: 2 }}>{t.description.slice(0, 70)}{t.description.length > 70 ? "…" : ""}</div>}
                    </td>
                    <td><span className="badge badge-gray">{proj?.name || "Unknown Project"}</span></td>
                    <td>{priorityBadge(t.priority)}</td>
                    <td>
                      <select className="form-select" style={{ width: "auto", padding: "4px 8px", fontSize: 12.5 }} value={t.status}
                        onChange={e => { updateTask(t.id, { status: e.target.value }); showToast("Task status updated!"); }}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td>{dueDateLabel(t.dueDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}