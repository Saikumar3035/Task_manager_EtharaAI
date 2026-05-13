import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Avatar, statusBadge, priorityBadge, dueDateLabel, getProjectRole } from "../components/Utils";

export default function ProjectDetailPage() {
  const { currentUser, projects, tasks, users, updateProject, deleteProject, updateTask, deleteTask, setPage, activeProjectId, showToast } = useApp();
  const project = projects.find(p => p.id === activeProjectId);
  const [tab, setTab] = useState("board");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  if (!project) return <div className="empty-state"><div className="empty-desc">Project not found.</div></div>;

  const role = getProjectRole(project, currentUser.id);
  const isAdmin = role === "admin";
  const ptasks = tasks.filter(t => t.projectId === project.id);
  const members = project.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  const filtered = ptasks.filter(t => {
    const byPriority = filterPriority === "all" || t.priority === filterPriority;
    const byAssignee = filterAssignee === "all" || t.assigneeId === filterAssignee;
    return byPriority && byAssignee;
  });

  const todo = filtered.filter(t => t.status === "todo");
  const inProgress = filtered.filter(t => t.status === "in-progress");
  const done = filtered.filter(t => t.status === "done");

  const handleMoveTask = (task, newStatus) => {
    if (!isAdmin && task.assigneeId !== currentUser.id) { showToast("You can only update tasks assigned to you", "error"); return; }
    updateTask(task.id, { status: newStatus });
    showToast("Task status updated");
  };

  const handleDeleteProject = () => {
    if (!window.confirm(`Delete "${project.name}"? This will also delete all tasks.`)) return;
    deleteProject(project.id);
    setPage("projects");
    showToast("Project deleted");
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>{project.name}</h1>
            <span className={`badge ${isAdmin ? "badge-blue" : "badge-gray"}`}>{isAdmin ? "Admin" : "Member"}</span>
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text3)", marginBottom: 12 }}>{project.description}</div>
          <div className="flex items-center gap-12">
            <div className="avatar-stack">{members.slice(0, 5).map(m => <Avatar key={m.id} user={m} size={26} />)}</div>
            <span className="text-sm text-muted">{members.length} member{members.length !== 1 ? "s" : ""}</span>
            <span className="text-sm text-muted">·</span>
            <span className="text-sm text-muted">{ptasks.length} tasks</span>
            <span className="text-sm text-muted">·</span>
            <span className="text-sm text-muted">{ptasks.filter(t => t.status === "done").length} done</span>
          </div>
        </div>
        <div className="flex gap-8">
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setShowSettingsModal(true)}><Icon.Edit />Manage</button>}
          {(isAdmin || role === "member") && <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}><Icon.Plus />Task</button>}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "board" ? "active" : ""}`} onClick={() => setTab("board")}>Board</button>
        <button className={`tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>List</button>
        <button className={`tab ${tab === "members" ? "active" : ""}`} onClick={() => setTab("members")}>Members</button>
      </div>

      <div className="filter-bar">
        <select className="form-select" style={{ width: "auto", padding: "6px 10px", fontSize: 13 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-select" style={{ width: "auto", padding: "6px 10px", fontSize: 13 }} value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
          <option value="all">All Members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {tab === "board" && (
        <div className="kanban">
          {[["todo", "To Do", todo, "var(--text3)"], ["in-progress", "In Progress", inProgress, "var(--accent)"], ["done", "Done", done, "var(--green)"]].map(([status, label, col, color]) => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-dot" style={{ background: color }} />
                <span className="kanban-col-title">{label}</span>
                <span className="kanban-count">{col.length}</span>
              </div>
              {col.map(t => <TaskCard key={t.id} task={t} members={members} isAdmin={isAdmin} onEdit={() => { setEditTask(t); setShowTaskModal(true); }} onMove={handleMoveTask} onDelete={() => { deleteTask(t.id); showToast("Task deleted"); }} currentUser={currentUser} />)}
              {col.length === 0 && <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--text3)", fontSize: 13 }}>No tasks</div>}
            </div>
          ))}
        </div>
      )}

      {tab === "list" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th>{isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>No tasks match filters</td></tr>
                ) : filtered.map(t => {
                  const assignee = users.find(u => u.id === t.assigneeId);
                  const canEdit = isAdmin || t.assigneeId === currentUser.id;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.title}</div>
                        {t.description && <div className="text-sm text-muted" style={{ marginTop: 2 }}>{t.description.slice(0, 60)}{t.description.length > 60 ? "…" : ""}</div>}
                      </td>
                      <td><div className="flex items-center gap-8"><Avatar user={assignee} size={24} /><span>{assignee?.name.split(" ")[0]}</span></div></td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>
                        {canEdit ? (
                          <select className="form-select" style={{ width: "auto", padding: "4px 8px", fontSize: 12.5 }} value={t.status} onChange={e => handleMoveTask(t, e.target.value)}>
                            <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                          </select>
                        ) : statusBadge(t.status)}
                      </td>
                      <td>{dueDateLabel(t.dueDate)}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex gap-8">
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditTask(t); setShowTaskModal(true); }}><Icon.Edit /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => { deleteTask(t.id); showToast("Task deleted"); }}><Icon.Trash /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Team Members</div>
            <span className="badge badge-gray">{members.length}</span>
          </div>
          <div className="card-body">
            {members.map(m => {
              const mTasks = ptasks.filter(t => t.assigneeId === m.id);
              const mDone = mTasks.filter(t => t.status === "done").length;
              const isThisAdmin = project.adminId === m.id;
              return (
                <div key={m.id} className="member-row">
                  <Avatar user={m} size={38} />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-8">
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</span>
                      {isThisAdmin && <span className="badge badge-blue"><Icon.Crown style={{ width: 10, height: 10 }} />Admin</span>}
                      {m.id === currentUser.id && <span className="badge badge-gray">You</span>}
                    </div>
                    <div className="text-sm text-muted">{m.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{mTasks.length} tasks</div>
                    <div className="text-sm text-muted">{mDone} completed</div>
                  </div>
                  {isAdmin && m.id !== currentUser.id && m.id !== project.adminId && (
                    <button className="btn btn-danger btn-sm" onClick={() => {
                      updateProject(project.id, { memberIds: project.memberIds.filter(id => id !== m.id) });
                      showToast(`${m.name} removed from project`);
                    }}><Icon.Trash /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showTaskModal && <TaskModal project={project} members={members} editTask={editTask} onClose={() => { setShowTaskModal(false); setEditTask(null); }} />}
      {showSettingsModal && <ProjectSettingsModal project={project} onClose={() => setShowSettingsModal(false)} onDelete={handleDeleteProject} />}
    </>
  );
}

function TaskCard({ task, members, isAdmin, onEdit, onMove, onDelete, currentUser }) {
  const assignee = members.find(m => m.id === task.assigneeId);
  const canEdit = isAdmin || task.assigneeId === currentUser.id;
  const statuses = task.status === "todo" ? ["in-progress", "done"] : task.status === "in-progress" ? ["todo", "done"] : ["todo", "in-progress"];
  const statusLabels = { todo: "To Do", "in-progress": "In Progress", done: "Done" };

  return (
    <div className="task-card">
      <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
        {priorityBadge(task.priority)}
        {isAdmin && (
          <div className="flex gap-8 ml-auto">
            <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={onEdit}><Icon.Edit /></button>
            <button className="btn btn-danger btn-sm" style={{ padding: "2px 6px" }} onClick={onDelete}><Icon.Trash /></button>
          </div>
        )}
      </div>
      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? "…" : ""}</div>}
      <div className="task-card-meta" style={{ marginTop: 8 }}>
        {assignee && <Avatar user={assignee} size={20} />}
        {dueDateLabel(task.dueDate)}
      </div>
      {canEdit && (
        <div className="flex gap-6" style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          {statuses.map(s => (
            <button key={s} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11.5, padding: "4px 6px" }} onClick={() => onMove(task, s)}>
              → {statusLabels[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskModal({ project, members, editTask, onClose }) {
  // Added 'users' to the context destructuring
  const { currentUser, addTask, updateTask, showToast, users } = useApp();
  const isEdit = !!editTask;
  
  const [form, setForm] = useState(editTask || { 
    title: "", 
    description: "", 
    status: "todo", 
    priority: "medium", 
    assigneeId: currentUser.id, 
    dueDate: "" 
  });
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isGlobalAdmin = currentUser?.role === "admin";
  const isProjectAdmin = project?.adminId === currentUser?.id;
  const canAssignTask = isGlobalAdmin || isProjectAdmin;

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (isEdit) {
      updateTask(editTask.id, form);
      showToast("Task updated");
    } else {
      addTask({ 
        ...form, 
        projectId: project.id, 
        createdBy: currentUser.id 
      });
      showToast("Task created!");
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Task" : "Create Task"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title" value={form.title} onChange={e => set("title", e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Optional description…" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select 
                className="form-select" 
                value={form.assigneeId} 
                onChange={e => set("assigneeId", e.target.value)}
                disabled={!canAssignTask}
                style={{ cursor: !canAssignTask ? "not-allowed" : "pointer" }}
              >
                {/* Fixed: Mapping over global 'users' instead of project 'members' */}
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}{u.id === currentUser.id ? " (You)" : ""}
                  </option>
                ))}
              </select>
              {!canAssignTask && (
                 <div className="text-sm text-muted" style={{ marginTop: 4 }}>Only team leaders can re-assign tasks.</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>{isEdit ? "Save Changes" : "Create Task"}</button>
        </div>
      </div>
    </div>
  );
}