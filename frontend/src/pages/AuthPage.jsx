import { useState } from "react";
import { useApp } from "../context/AppContext";

const API_URL = import.meta.env.VITE_API_URL + "/api/auth"; // ✅ Correct

export default function AuthPage() {
  const { setCurrentUser, showToast } = useApp();
  
  // States
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [isAdminPortal, setIsAdminPortal] = useState(false); // Toggles the bottom admin view
  
  const [form, setForm] = useState({ name: "", email: "", password: "", adminSecret: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Email and password are required.");
    if (mode === "signup" && !form.name) return setError("Name is required.");
    
    // Validate Admin Secret if trying to register as an admin
    if (mode === "signup" && isAdminPortal && !form.adminSecret) {
      return setError("Admin Secret Code is required to create an Admin account.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/signup";
      
      // Determine the role based on which portal they are using
      const role = isAdminPortal ? "admin" : "member";
      const payload = { ...form, role };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      // Save JWT token
      localStorage.setItem("token", data.token);
      
      // Map _id to id for the frontend
      const userObj = { 
        ...data, 
        id: data._id, 
        initials: data.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2), 
        color: "#ff3b00" 
      };
      
      setCurrentUser(userObj);
      showToast(mode === "login" ? `Welcome back, ${data.name.split(" ")[0]}! 👋` : `Account created! Welcome, ${data.name.split(" ")[0]}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ borderTop: isAdminPortal ? '4px solid var(--amber)' : '4px solid var(--accent)' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ background: isAdminPortal ? 'var(--amber)' : 'var(--accent)', boxShadow: isAdminPortal ? '0 4px 12px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(255,59,0,0.25)' }}>
            {isAdminPortal ? '🛡️' : 'T'}
          </div>
          <div className="auth-title">{isAdminPortal ? 'Workspace Admin' : 'Ethara.ai Collaborative Workspace'}</div>
          <div className="auth-sub">
            {isAdminPortal ? 'Manage your team and projects safely.' : 'Collaborative project & task management'}
          </div>
        </div>
        
        <div className="auth-body">
          <div className="auth-toggle">
            <button className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Sign In</button>
            <button className={`auth-toggle-btn ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Create Account</button>
          </div>
          
          {error && <div className="auth-error" style={{ padding: '12px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
          
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="name@company.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {/* Admin Secret Code Field - Only shows if registering as Admin */}
          {mode === "signup" && isAdminPortal && (
            <div className="form-group" style={{ padding: '16px', background: 'var(--amber-bg)', borderRadius: 'var(--r2)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <label className="form-label" style={{ color: 'var(--amber)' }}>Admin Secret Code *</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="Enter workspace security code" 
                value={form.adminSecret} 
                onChange={e => set("adminSecret", e.target.value)} 
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
              />
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Required to authorize this account with admin privileges.</div>
            </div>
          )}
          
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: '12px', fontSize: '15px', background: isAdminPortal ? 'var(--amber)' : 'var(--accent)' }} 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </div>

        {/* BOTTOM TOGGLE AREA */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg3)', textAlign: 'center' }}>
          <button 
            onClick={() => {
              setIsAdminPortal(!isAdminPortal);
              setError("");
              setForm(f => ({ ...f, adminSecret: "" })); // Clear secret when switching
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
            onMouseEnter={e => e.target.style.color = isAdminPortal ? 'var(--accent)' : 'var(--amber)'}
            onMouseLeave={e => e.target.style.color = 'var(--text3)'}
          >
            {isAdminPortal ? "← Return to Standard User Portal" : "Are you a workspace Admin? Log in here"}
          </button>
        </div>

      </div>
    </div>
  );
}