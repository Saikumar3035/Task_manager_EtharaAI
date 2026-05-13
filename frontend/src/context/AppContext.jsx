import { useState, useContext, createContext, useCallback, useEffect } from "react";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const API_URL = "http://localhost:5000/api";

let toastTimer = null;

const formatUser = (u) => {
  const name = u.name || "Unknown User";
  const initials = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6c8fff", "#34d399", "#fbbf24", "#a78bfa", "#f87171", "#22d3ee", "#fb923c"];
  const color = colors[u._id ? u._id.charCodeAt(u._id.length - 1) % colors.length : 0];
  return { ...u, id: u._id, name, initials, color };
};

const formatProject = (p) => ({
  ...p,
  id: p._id,
  name: p.projectName || "Unnamed Project",
  adminId: p.createdBy,
  memberIds: p.members?.map(m => m._id || m) || []
});

const formatTask = (t) => {
  let status = (t.status || 'todo').toLowerCase();
  if (status === 'to do') status = 'todo';
  if (status === 'in progress') status = 'in-progress';
  
  let priority = (t.priority || 'medium').toLowerCase();

  return {
    ...t,
    id: t._id,
    assigneeId: t.assignedTo?._id || t.assignedTo,
    projectId: t.projectId?._id || t.projectId,
    status,
    priority,
    title: t.title || "Untitled Task",
    description: t.description || "",
    dueDate: t.dueDate ? t.dueDate.split('T')[0] : "",
    createdBy: t.createdBy?._id || t.createdBy
  };
};

const mapTaskToDb = (data) => {
  const payload = { ...data };
  
  if (data.assigneeId) payload.assignedTo = data.assigneeId;
  if (data.projectId) payload.projectId = data.projectId;
  
  if (payload.status) {
    if (payload.status === 'todo') payload.status = 'todo';
    if (payload.status === 'in-progress') payload.status = 'in-progress';
    if (payload.status === 'done') payload.status = 'done';
  }
  
  if (payload.priority) {
    payload.priority = payload.priority.toLowerCase();
  }
  
  return payload;
};

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  // ✅ FIX 1: Restore currentUser from localStorage on refresh
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ✅ FIX 2: Restore page from localStorage on refresh
  const [page, setPageState] = useState(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("currentPage");
    return token && saved ? saved : (localStorage.getItem("token") ? "dashboard" : "login");
  });

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [toast, setToast] = useState(null);

  // ✅ FIX 3: Wrap setCurrentUser to also save to localStorage
  const setCurrentUser = (user) => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("currentPage");
    }
    setCurrentUserState(user);
  };

  // ✅ FIX 4: Wrap setPage to also save to localStorage
  const setPage = (p) => {
    localStorage.setItem("currentPage", p);
    setPageState(p);
  };

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(null), 3000);
  }, []);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchAllData = async () => {
      try {
        const [resUsers, resProj, resTasks] = await Promise.all([
          fetch(`${API_URL}/auth/users`, { headers: getHeaders() }),
          fetch(`${API_URL}/projects`, { headers: getHeaders() }),
          fetch(`${API_URL}/tasks`, { headers: getHeaders() })
        ]);

        if (resUsers.ok) {
          const data = await resUsers.json();
          setUsers(data.map(formatUser));
        }
        if (resProj.ok) {
          const data = await resProj.json();
          setProjects(data.map(formatProject));
        }
        if (resTasks.ok) {
          const data = await resTasks.json();
          setTasks(data.map(formatTask));
        }
      } catch (err) {
        showToast("Error loading dashboard data", "error");
      }
    };

    fetchAllData();
  }, [currentUser, showToast]);

  const addProject = async (data) => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ projectName: data.name, description: data.description, members: data.memberIds })
      });
      if (res.ok) {
        const newProj = await res.json();
        setProjects(prev => [...prev, formatProject(newProj)]);
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to create project", "error");
      }
    } catch (err) { showToast("Network error", "error"); }
  };

  const updateProject = async (id, data) => {
    try {
      const payload = {};
      if (data.name) payload.projectName = data.name;
      if (data.description) payload.description = data.description;
      if (data.memberIds) payload.members = data.memberIds;

      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedProj = await res.json();
        setProjects(prev => prev.map(p => p.id === id ? formatProject(updatedProj) : p));
      }
    } catch (err) { showToast("Network error", "error"); }
  };

  const deleteProject = async (id) => {
    try {
      await fetch(`${API_URL}/projects/${id}`, { method: "DELETE", headers: getHeaders() });
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
    } catch (err) { showToast("Failed to delete project", "error"); }
  };

  const addTask = async (data) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(mapTaskToDb(data))
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, formatTask(newTask)]);
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to create task", "error");
      }
    } catch (err) { showToast("Network error", "error"); }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(mapTaskToDb(data))
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? formatTask(updatedTask) : t));
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to update task", "error");
      }
    } catch (err) { showToast("Network error", "error"); }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers: getHeaders() });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) { showToast("Failed to delete task", "error"); }
  };

  const ctx = {
    users, projects, tasks, currentUser, setCurrentUser,
    page, setPage, activeProjectId, setActiveProjectId,
    toast, showToast, addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask
  };

  return <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>;
}
