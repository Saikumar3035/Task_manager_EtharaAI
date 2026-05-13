import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Avatar, statusBadge, priorityBadge, getProjectRole } from "../components/Utils";

export default function DashboardPage() {
  const { currentUser, projects, tasks, users, setPage, setActiveProjectId } = useApp();
  
  // Reference for the PDF export
  const reportRef = useRef();

  const myProjects = projects.filter(p => p.memberIds.includes(currentUser?.id));
  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  
  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "done");
  const inProgress = myTasks.filter(t => t.status === "in-progress");
  const done = myTasks.filter(t => t.status === "done");
  const allOverdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "done");

  const statusCounts = { todo: 0, "in-progress": 0, done: 0 };
  myTasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  const recentActivity = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // --- REPORT EXPORT FUNCTIONS ---
  
  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin:       0.5,
      filename:     `TaskFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleDownloadCSV = () => {
    // Define CSV Headers
    const headers = ["Task Title", "Project", "Status", "Priority", "Due Date", "Assignee"];
    
    // Map data to rows
    const rows = tasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)?.name || "N/A";
      const assignee = users.find(u => u.id === t.assigneeId)?.name || "Unassigned";
      // Wrap strings in quotes to prevent comma breaks
      return `"${t.title}","${proj}","${t.status}","${t.priority}","${t.dueDate || 'No Date'}","${assignee}"`;
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TaskFlow_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* We wrap the entire dashboard in the ref so the PDF captures everything */}
      <div ref={reportRef} style={{ padding: '10px' }}>
        
        {/* OVERVIEW CONTAINER */}
        <div style={{ background: 'var(--bg2)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '32px', boxShadow: 'var(--shadow)' }}>
          
          {/* Header Row with Export Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Overview
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                Dashboard
              </h1>
            </div>
            
            {/* New Export Actions Group */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDownloadCSV} className="btn btn-ghost" style={{ borderRadius: '30px', background: 'var(--bg3)', border: 'none', padding: '8px 16px', fontWeight: 600 }}>
                📄 Export CSV
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ borderRadius: '30px', padding: '8px 16px', fontWeight: 600, boxShadow: '0 4px 12px rgba(255, 59, 0, 0.2)' }}>
                📥 Download PDF Report
              </button>
            </div>
          </div>

          {/* 3 Metric Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Card 1: TASKS */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text3)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                TASKS
              </div>
              <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{myTasks.length}</div>
              <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Active tasks across projects</div>
            </div>

            {/* Card 2: COMPLETED */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text3)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                COMPLETED
              </div>
              <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{done.length}</div>
              <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Tasks finished </div>
            </div>

            {/* Card 3: PROJECTS */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text3)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                PROJECTS
              </div>
              <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{myProjects.length}</div>
              <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Projects currently in progress</div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Projects</div>
              {/* Hide the 'View all' button from the PDF to keep it clean */}
              <button data-html2canvas-ignore className="btn btn-ghost btn-sm" onClick={() => setPage("projects")}>View all <Icon.ArrowRight /></button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {myProjects.length === 0 ? <div className="empty-state" style={{ border: 'none' }}><div className="empty-desc">No projects yet</div></div> :
                myProjects.slice(0, 4).map(p => {
                  const ptasks = tasks.filter(t => t.projectId === p.id);
                  const pdone = ptasks.filter(t => t.status === "done").length;
                  const pct = ptasks.length ? Math.round((pdone / ptasks.length) * 100) : 0;
                  const role = getProjectRole(p, currentUser?.id);
                  return (
                    <div key={p.id} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{p.name}</span>
                        <span className={`badge ${role === "admin" ? "badge-blue" : "badge-gray"}`} style={{ marginLeft: "auto" }}>{role === "admin" ? "Admin" : "Member"}</span>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: pct + "%" }} /></div>
                        <span className="text-sm text-muted font-mono" style={{ fontWeight: 600 }}>{pct}%</span>
                        <span className="text-sm text-muted">{ptasks.length} tasks</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">My Tasks Status</div></div>
            <div className="card-body">
              {["todo", "in-progress", "done"].map(s => {
                const cnt = statusCounts[s];
                const pct = myTasks.length ? Math.round((cnt / myTasks.length) * 100) : 0;
                const labels = { todo: ["To Do", "var(--text3)"], "in-progress": ["In Progress", "var(--accent)"], done: ["Done", "var(--green)"] };
                return (
                  <div key={s} style={{ marginBottom: 20 }}>
                    <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", flex: 1 }}>{labels[s][0]}</span>
                      <span className="font-mono" style={{ fontSize: 14, color: "var(--text)", fontWeight: 700 }}>{cnt}</span>
                      <span className="text-muted text-sm font-mono" style={{ width: 40, textAlign: 'right' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: pct + "%", background: labels[s][1] }} /></div>
                  </div>
                );
              })}
              <hr className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text3)", fontWeight: 600 }}>
                <span>Total assigned</span>
                <span className="font-mono" style={{ color: "var(--text)", fontWeight: 700 }}>{myTasks.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span style={{ color: "var(--red)", marginRight: 6 }}>⚠</span> Overdue Tasks</div>
              <span className="badge badge-red">{allOverdue.length}</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {allOverdue.length === 0 ? (
                <div className="empty-state" style={{ border: 'none' }}><div className="empty-icon"></div><div className="empty-title">All caught up!</div></div>
              ) : allOverdue.slice(0, 5).map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                const daysOver = Math.round((new Date() - new Date(t.dueDate)) / 86400000);
                return (
                  <div key={t.id} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
                    {priorityBadge(t.priority)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{t.title}</div>
                      <div className="text-sm text-muted">{proj?.name || "Unknown Project"}</div>
                    </div>
                    <span style={{ color: "var(--red)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", background: 'var(--red-bg)', padding: '4px 10px', borderRadius: '8px' }}>{daysOver}d overdue</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Recent Activity</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentActivity.length === 0 ? (
                <div className="empty-state" style={{ border: 'none' }}><div className="empty-desc">No recent activity</div></div>
              ) : recentActivity.map(t => {
                const creator = users.find(u => u.id === t.createdBy);
                const proj = projects.find(p => p.id === t.projectId);
                return (
                  <div key={t.id} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                    {creator ? (
                      <Avatar user={creator} size={32} />
                    ) : (
                      <div className="user-avatar" style={{ width: 32, height: 32, background: "var(--bg4)", color: "var(--text2)", fontSize: 12 }}>?</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: "var(--text)" }}>
                        {creator ? (
                          <><strong style={{ fontWeight: 600 }}>{creator.name.split(" ")[0]}</strong> created </>
                        ) : (
                          <><strong style={{ fontWeight: 600 }}>New task:</strong> </>
                        )}
                        <em style={{ fontStyle: "normal", color: "var(--accent)", fontWeight: 500 }}>{t.title}</em>
                      </div>
                      <div className="text-sm text-muted" style={{ marginTop: 2 }}>{proj?.name || "Unknown Project"} · {t.dueDate ? `Due ${t.dueDate}` : "No due date"}</div>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}