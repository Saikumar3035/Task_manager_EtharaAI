import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Avatar, getProjectRole } from "../components/Utils";

export default function ProjectsPage() {
  const { currentUser, projects, tasks, users, setPage, setActiveProjectId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ✅ FEATURE RESTORED: Admin-only button logic
  const isGlobalAdmin = currentUser?.role === "admin";

  // ✅ FEATURE RESTORED: Filtering and Search logic
  const myProjects = projects.filter(p => p.memberIds.includes(currentUser?.id));
  const filtered = myProjects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                        p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || 
                        (filter === "admin" && p.adminId === currentUser?.id) || 
                        (filter === "member" && p.adminId !== currentUser?.id);
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Projects</div>
          <div className="text-sm text-muted">{myProjects.length} project{myProjects.length !== 1 ? "s" : ""} you're part of</div>
        </div>
        {isGlobalAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon.Plus />New Project
          </button>
        )}
      </div>

      {/* ✅ FEATURE RESTORED: Full Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon"><Icon.Search /></span>
          <input className="search-input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`filter-btn ${filter === "admin" ? "active" : ""}`} onClick={() => setFilter("admin")}>Admin</button>
        <button className={`filter-btn ${filter === "member" ? "active" : ""}`} onClick={() => setFilter("member")}>Member</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects found</div>
          <div className="empty-desc">
            {isGlobalAdmin ? "Create your first project to get started" : "You haven't been assigned to any projects yet."}
          </div>
          {isGlobalAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Icon.Plus />New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => {
            // ✅ FEATURE RESTORED: Progress calculation and task tracking
            const ptasks = tasks.filter(t => t.projectId === p.id);
            const pdone = ptasks.filter(t => t.status === "done").length;
            const pct = ptasks.length ? Math.round((pdone / ptasks.length) * 100) : 0;
            const members = p.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
            const role = getProjectRole(p, currentUser?.id);
            
            return (
              <div key={p.id} className="project-card" onClick={() => { setActiveProjectId(p.id); setPage("project"); }}>
                <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
                  <span className={`badge ${role === "admin" ? "badge-blue" : "badge-gray"}`}>{role === "admin" ? "👑 Admin" : "Member"}</span>
                  <span className="ml-auto text-muted text-sm">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="project-card-title">{p.name}</div>
                <div className="project-card-desc">{p.description}</div>
                <div className="progress-bar" style={{ marginBottom: 12 }}><div className="progress-fill" style={{ width: pct + "%" }} /></div>
                <div className="project-card-footer">
                  <div className="avatar-stack">
                    {members.slice(0, 4).map(m => <Avatar key={m.id} user={m} size={24} />)}
                    {members.length > 4 && <div className="user-avatar" style={{ width: 24, height: 24, background: "var(--bg4)", color: "var(--text2)", fontSize: 10 }}>+{members.length - 4}</div>}
                  </div>
                  <span className="ml-auto text-sm text-muted">{ptasks.length} tasks · {pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function CreateProjectModal({ onClose }) {
  const { currentUser, users, addProject, showToast } = useApp();
  
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    members: [] // Starts empty per your request
  });

  const toggleMember = (id) => {
    setForm(f => ({ 
      ...f, 
      members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id] 
    }));
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    addProject({ 
      name: form.name.trim(), 
      description: form.description.trim(), 
      memberIds: form.members 
    });
    showToast(`Project "${form.name}" created!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Create New Project</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Mobile App Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="What is this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            {/* ✅ NEW UI: Header with "X selected" badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Add Team Members</label>
              {form.members.length > 0 && (
                <span style={{ 
                  fontSize: "11px", 
                  backgroundColor: "var(--accent-glow)", 
                  color: "var(--accent)", 
                  padding: "2px 8px", 
                  borderRadius: "12px", 
                  fontWeight: "600",
                  border: "1px solid rgba(108,143,255,0.2)"
                }}>
                  {form.members.length} selected
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
              {users?.map(u => (
                <div key={u.id} style={{ 
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r)", 
                    background: form.members.includes(u.id) ? "var(--accent-glow)" : "var(--bg3)", 
                    border: `1px solid ${form.members.includes(u.id) ? "rgba(108,143,255,0.3)" : "var(--border)"}`, 
                    cursor: "pointer", transition: "all 0.15s" 
                  }}
                  onClick={() => toggleMember(u.id)}
                >
                  <Avatar user={u} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>
                      {u.name} {u.id === currentUser?.id && <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(You)</span>}
                    </div>
                    <div className="text-sm text-muted">{u.email}</div>
                  </div>
                  
                  {/* ✅ NEW UI: Checkbox Square from image_567c98.png */}
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "4px",
                    border: `1px solid ${form.members.includes(u.id) ? "var(--accent)" : "var(--border)"}`,
                    background: form.members.includes(u.id) ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                  }}>
                    {form.members.includes(u.id) && <Icon.Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>Create Project</button>
        </div>
      </div>
    </div>
  );
}