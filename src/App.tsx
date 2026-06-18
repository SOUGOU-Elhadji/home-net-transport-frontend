// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import PlanningView from "./components/PlanningView";
import RidesList from "./components/RidesList";
import ClientsList from "./components/ClientsList";
import ChauffeursList from "./components/ChauffeursList";
import VehiclesList from "./components/VehiclesList";
import InvoicesList from "./components/InvoicesList";
import RapportsView from "./components/RapportsView";
import SettingsView from "./components/SettingsView";
import ChauffeurDashboard from "./components/ChauffeurDashboard";
import { User, Notification } from "./types";
import { api } from "./utils/api";
import { 
  Bell, 
  Map, 
  Calendar, 
  Users, 
  Truck, 
  Layers, 
  FileCheck, 
  BarChart4, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  UserCheck, 
  Activity,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "planning" | "rides" | "clients" | "chauffeurs" | "vehicles" | "invoices" | "reports" | "settings"
  >("dashboard");

  // Notification lists
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Connection forms data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  
  // Mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [token]);

  const loadNotifications = async () => {
    if (user && user.role !== "CHAUFFEUR") {
      try {
        const res = await api.get("/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.log("No notifications server side module or fallback used.");
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30 sec poll
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setLoginError(null);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { user: connectedUser, token: receivedToken } = res.data;
      
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(connectedUser));
      setToken(receivedToken);
      setUser(connectedUser);
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Identifiants incorrects ou serveur injoignable.");
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  // const handleQuickDemoSession = (role: "SUPER_ADMIN" | "BUREAU" | "CHAUFFEUR") => {
  //   // Generate an automatic demo profile for immediate playability
  //   const demoProfile: User = {
  //     id: "demo-id-123",
  //     email: role === "SUPER_ADMIN" ? "admin@homenet.fr" : role === "BUREAU" ? "bureau@homenet.fr" : "chauffeur@homenet.fr",
  //     firstName: role === "SUPER_ADMIN" ? "Jean-Marc" : role === "BUREAU" ? "Aurélie" : "David",
  //     lastName: role === "SUPER_ADMIN" ? "Benoit" : role === "BUREAU" ? "Grange" : "Vignaud",
  //     role: role,
  //     licenseNumber: "PERMIS-9082-A",
  //     licenseExpiry: "2029-12-31",
  //     status: "ACTIVE",
  //     createdAt: new Date().toISOString()
  //   };
    
  //   localStorage.setItem("token", "demo-mock-jwt-token");
  //   localStorage.setItem("user", JSON.stringify(demoProfile));
  //   setToken("demo-mock-jwt-token");
  //   setUser(demoProfile);
  // };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.post("/api/notifications/read");
      setNotifications([]);
      setShowNotifications(false);
    } catch (err) {
      setNotifications([]);
    }
  };

  // Login view component
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-950 border border-slate-805 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-800 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-lg mx-auto shadow-md">
              HN
            </div>
            <h2 className="text-xl font-bold text-slate-50 mt-4 font-sans tracking-tight">HOME NET Transport</h2>
            <p className="text-xs text-slate-400 mt-1 pb-1">Plateforme de Gestion & Planification Professionnelle</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-red-950/40 border border-red-900 p-3 rounded-lg text-xs text-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Adresse Email Professionnelle</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: admin@homenet.fr"
                className="w-full border border-slate-800 bg-slate-900 text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Mot de passe</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-800 bg-slate-900 text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit"
              disabled={connecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold text-sm py-2.5 rounded-lg shadow transition"
            >
              {connecting ? "Vérification en cours..." : "Connexion sécurisée"}
            </button>
          </form>

          {/* Quick Sandbox Demo trigger panel */}
          {/* <div className="p-6 border-t border-slate-800 bg-slate-900/40 text-center space-y-3">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Console Sandbox – Accès rapide de démonstration</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleQuickDemoSession("SUPER_ADMIN")}
                className="bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-[10px] py-1.5 px-1 rounded-lg text-slate-400 font-semibold shadow-2xs"
              >
                Super Admin
              </button>
              <button 
                onClick={() => handleQuickDemoSession("BUREAU")}
                className="bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-[10px] py-1.5 px-1 rounded-lg text-slate-400 font-semibold shadow-2xs"
              >
                Agent Bureau
              </button>
              <button 
                onClick={() => handleQuickDemoSession("CHAUFFEUR")}
                className="bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-[10px] py-1.5 px-1 rounded-lg text-slate-400 font-semibold shadow-2xs"
              >
                Chauffeur
              </button>
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  // Chauffeur layout view
  if (user.role === "CHAUFFEUR") {
    return <ChauffeurDashboard user={user} onLogout={handleLogout} />;
  }

  // Office & Administration space layout
  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased text-sm">
      
      {/* Persistent desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-950 text-slate-100 w-64 border-r border-slate-800 transform lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out z-50 flex flex-col justify-between`}>
        <div>
          {/* Header branding */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm">
                HN
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">HOME NET</h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Transport</p>
              </div>
            </div>
            <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Tableau de Bord</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("planning"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "planning" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Planning & Calendriers</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("rides"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "rides" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Saisie des Trajets</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("clients"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "clients" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Fiches Clients</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("chauffeurs"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "chauffeurs" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Chauffeurs</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("vehicles"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "vehicles" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Véhicules & Maintenance</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("invoices"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "invoices" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>Facturation & Encaissements</span>
            </button>

            <button 
              onClick={() => { setActiveMenu("reports"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMenu === "reports" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <BarChart4 className="w-4 h-4 shrink-0" />
              <span>Rapports & Exports</span>
            </button>

            {user.role === "SUPER_ADMIN" && (
              <button 
                onClick={() => { setActiveMenu("settings"); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeMenu === "settings" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Paramètres Système</span>
              </button>
            )}
          </nav>
        </div>

        {/* User profile footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="truncate max-w-[150px]">
            <p className="text-xs font-semibold truncate text-slate-100">{user.firstName} {user.lastName.toUpperCase()}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Se Déconnecter"
            className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main workspace layout */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Upper topbar navigation */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-5 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button 
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-800 text-base md:text-lg">
              {activeMenu === "dashboard" && "Tableau de Bord"}
              {activeMenu === "planning" && "Planning Interactif"}
              {activeMenu === "rides" && "Fiches de Trajets"}
              {activeMenu === "clients" && "Bénéficiaires & Clients"}
              {activeMenu === "chauffeurs" && "Chauffeurs"}
              {activeMenu === "vehicles" && "Véhicules"}
              {activeMenu === "invoices" && "Facturation"}
              {activeMenu === "reports" && "Rapports & Statistiques"}
              {activeMenu === "settings" && "Habilitations & Configurations"}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Alarm Notifications panel */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-3 z-50">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Alertes système ({notifications.length})</span>
                    <button onClick={handleMarkNotificationsRead} className="text-[10px] font-bold text-blue-600 hover:underline">
                      Tout marquer lu
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 text-center">Aucune notification en attente.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-xs border-b border-slate-50 pb-2 last:border-none last:pb-0">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block border-l border-slate-200 pl-3">
              <p className="text-xs font-bold text-slate-700">{user.firstName} {user.lastName.toUpperCase()}</p>
              <p className="text-[10px] text-slate-450 font-bold tracking-wider uppercase">{user.role}</p>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-5 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {activeMenu === "dashboard" && <Dashboard />}
          {activeMenu === "planning" && <PlanningView />}
          {activeMenu === "rides" && <RidesList />}
          {activeMenu === "clients" && <ClientsList />}
          {activeMenu === "chauffeurs" && <ChauffeursList />}
          {activeMenu === "vehicles" && <VehiclesList />}
          {activeMenu === "invoices" && <InvoicesList />}
          {activeMenu === "reports" && <RapportsView />}
          {activeMenu === "settings" && <SettingsView />}
        </main>
      </div>

    </div>
  );
}
