import { AppProvider, useApp } from "./context/AppContext";
import { Icon } from "./components/Icons";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import "./index.css";

function AppContent() {
  const { currentUser, toast } = useApp();
  return (
    <div id="ttm-root">
      {!currentUser ? <AuthPage /> : <MainLayout />}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? <Icon.Check /> : <Icon.Alert />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}