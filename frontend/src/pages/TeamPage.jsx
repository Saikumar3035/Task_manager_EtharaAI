import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Avatar } from "../components/Utils";

export default function TeamPage() {
  const { users, projects, tasks, currentUser } = useApp();

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Team Directory</div>
          <div className="text-sm text-muted">{users.length} members in workspace</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
        {users.map(u => {
          const uTasks = tasks.filter(t => t.assigneeId === u.id);
          const uDone = uTasks.filter(t => t.status === "done").length;
          const uIP = uTasks.filter(t => t.status === "in-progress").length;
          const uProjects = projects.filter(p => p.memberIds.includes(u.id));
          const uAdminProjects = uProjects.filter(p => p.adminId === u.id);
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const uOverdue = uTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "done").length;
          const completionRate = uTasks.length ? Math.round((uDone / uTasks.length) * 100) : 0;

          return (
            <div key={u.id} className="card" style={{ padding: 0 }}>
              <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <Avatar user={u} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-8">
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{u.name}</span>
                    {u.id === currentUser.id && <span className="badge badge-blue">You</span>}
                  </div>
                  <div className="text-sm text-muted" style={{ marginBottom: 10 }}>{u.email}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span className="badge badge-gray"><Icon.Projects style={{ width: 12, height: 12 }} />{uProjects.length} projects</span>
                    {uAdminProjects.length > 0 && <span className="badge badge-blue">👑 Admin in {uAdminProjects.length}</span>}
                    {uOverdue > 0 && <span className="badge badge-red">⚠ {uOverdue} overdue</span>}
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[["Total Tasks", uTasks.length, "var(--text)"], ["In Progress", uIP, "var(--accent)"], ["Completed", uDone, "var(--green)"]].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color, fontFamily: "var(--mono)" }}>{val}</div>
                    <div className="text-sm text-muted">{label}</div>
                  </div>
                ))}
              </div>
              {uTasks.length > 0 && (
                <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
                    <span className="text-sm text-muted">Completion rate</span>
                    <span className="ml-auto text-sm font-mono" style={{ color: "var(--text)", fontWeight: 500 }}>{completionRate}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: completionRate + "%", background: completionRate >= 80 ? "var(--green)" : completionRate >= 50 ? "var(--accent)" : "var(--amber)" }} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Workspace Overview</div></div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              ["Total Members", users.length, "var(--accent)"],
              ["Total Projects", projects.length, "var(--purple)"],
              ["Total Tasks", tasks.length, "var(--cyan)"],
              ["Completed Tasks", tasks.filter(t => t.status === "done").length, "var(--green)"],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: "var(--bg3)", borderRadius: "var(--r)", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "var(--mono)" }}>{val}</div>
                <div className="text-sm text-muted" style={{ marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}