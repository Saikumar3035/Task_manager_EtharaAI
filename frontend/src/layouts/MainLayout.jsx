import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Avatar } from "../components/Utils";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import MyTasksPage from "../pages/MyTasksPage";
import TeamPage from "../pages/TeamPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";

export default function MainLayout() {
  const { currentUser, page, setPage, setCurrentUser, projects, tasks, activeProjectId, setActiveProjectId } = useApp();
  const myProjects = projects.filter(p => p.memberIds.includes(currentUser.id));
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

  const navTo = (p, projId = null) => { setPage(p); if (projId) setActiveProjectId(projId); };

  const pageNames = { dashboard: "Dashboard", projects: "Projects", tasks: "My Tasks", team: "Team", project: activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : "Project" };

  return (
    <div className="ttm-app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <div><div className="logo-text">TaskFlow</div><div className="logo-sub">Workspace</div></div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Main</div>
            <button className={`nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => navTo("dashboard")}><Icon.Dashboard />Dashboard</button>
            <button className={`nav-item ${page === "projects" ? "active" : ""}`} onClick={() => navTo("projects")}><Icon.Projects />Projects<span className="nav-badge">{myProjects.length}</span></button>
            <button className={`nav-item ${page === "tasks" ? "active" : ""}`} onClick={() => navTo("tasks")}><Icon.Tasks />My Tasks{overdue > 0 && <span className="nav-badge" style={{ background: "var(--red-bg)", color: "var(--red)" }}>{overdue}</span>}</button>
            <button className={`nav-item ${page === "team" ? "active" : ""}`} onClick={() => navTo("team")}><Icon.Team />Team</button>
          </div>
          {myProjects.length > 0 && (
            <div className="nav-section">
              <div className="nav-label">My Projects</div>
              {myProjects.map(p => (
                <button key={p.id} className={`nav-item ${page === "project" && activeProjectId === p.id ? "active" : ""}`} onClick={() => navTo("project", p.id)}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.adminId === currentUser.id ? "var(--accent)" : "var(--text3)", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  {p.adminId === currentUser.id && <span className="nav-badge" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>Admin</span>}
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <Avatar user={currentUser} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</div>
              <div className="user-role">{currentUser.email}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: "4px 6px", border: "none" }} title="Logout" onClick={() => setCurrentUser(null)}><Icon.Logout /></button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{pageNames[page]}</div>
          </div>
          <div className="ml-auto flex items-center gap-8">
            {overdue > 0 && <span className="badge badge-red"><Icon.Alert style={{ width: 12, height: 12 }} />{overdue} overdue</span>}
            <Avatar user={currentUser} size={30} />
          </div>
        </header>
        <div className="page">
          {page === "dashboard" && <DashboardPage />}
          {page === "projects" && <ProjectsPage />}
          {page === "tasks" && <MyTasksPage />}
          {page === "team" && <TeamPage />}
          {page === "project" && <ProjectDetailPage />}
        </div>
      </main>
    </div>
  );
}