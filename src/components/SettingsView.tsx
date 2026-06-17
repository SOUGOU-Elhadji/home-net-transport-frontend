// frontend/src/components/SettingsView.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ActivityLog, User } from "../types";
import { ShieldCheck, UserCheck, Settings, ShieldAlert, KeyRound, Wrench, FileEdit } from "lucide-react";

export default function SettingsView() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"enterprise" | "users" | "logs">("enterprise");

  // Company profile
  const [companyData, setCompanyData] = useState({
    name: "HOME NET Transport S.A.S.",
    email: "contact@homenet.fr",
    phone: "01 41 50 60 70",
    address: "24 Rue de l'Arrivée",
    city: "Vélizy-Villacoublay",
    postalCode: "78140",
    siret: "881 772 901 00012",
    ape: "4939B",
    taxRate: "10" // 10% standard public transit VAT
  });

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [lRes, uRes] = await Promise.all([
        api.get("/api/reports/logs"),
        api.get("/api/auth/users")
      ]);
      setLogs(lRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error("Error loading settings / restricted roles logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Données et configurations d'entreprise sauvegardées (Simulé).");
  };

  return (
    <div className="space-y-6">
      {/* Sub menu tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100 border border-slate-200 rounded-xl max-w-md">
        <button 
          onClick={() => setActiveSubTab("enterprise")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
            activeSubTab === "enterprise" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Coordonnées Entreprise
        </button>
        <button 
          onClick={() => setActiveSubTab("users")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
            activeSubTab === "users" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Gestion Logins & Rôles
        </button>
        <button 
          onClick={() => setActiveSubTab("logs")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
            activeSubTab === "logs" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Journal Audit Logs
        </button>
      </div>

      {activeSubTab === "enterprise" ? (
        <form onSubmit={handleCompanySave} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-3xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-base">Configuration Entreprise & Facturation</h4>
            <p className="text-xs text-slate-500 font-medium">Coordonnées légales de HOME NET Transport visibles sur les factures générées.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dénomination Sociale</label>
              <input 
                type="text" 
                value={companyData.name}
                onChange={(e) => setCompanyData(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone Secrétariat</label>
              <input 
                type="text" 
                value={companyData.phone}
                onChange={(e) => setCompanyData(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Entreprise</label>
              <input 
                type="text" 
                value={companyData.email}
                onChange={(e) => setCompanyData(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Adresse Siège</label>
              <input 
                type="text" 
                value={companyData.address}
                onChange={(e) => setCompanyData(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Code postal</label>
              <input 
                type="text" 
                value={companyData.postalCode}
                onChange={(e) => setCompanyData(p => ({ ...p, postalCode: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ville</label>
              <input 
                type="text" 
                value={companyData.city}
                onChange={(e) => setCompanyData(p => ({ ...p, city: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Numéro SIRET</label>
              <input 
                type="text" 
                value={companyData.siret}
                onChange={(e) => setCompanyData(p => ({ ...p, siret: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Code APE / NAF</label>
              <input 
                type="text" 
                value={companyData.ape}
                onChange={(e) => setCompanyData(p => ({ ...p, ape: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Taux de TVA (%)</label>
              <select
                value={companyData.taxRate}
                onChange={(e) => setCompanyData(p => ({ ...p, taxRate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 bg-white"
              >
                <option value="10">10% (Transport public)</option>
                <option value="20">20% (Prestation standard)</option>
                <option value="5.5">5.5% (Taux réduit santé)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm"
            >
              Enregistrer les Paramètres
            </button>
          </div>
        </form>
      ) : activeSubTab === "users" ? (
        // Users administration / RBAC table
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Gestion des Utilisateurs & Droits Logins</h4>
              <p className="text-xs text-slate-500">Ajout d'agents de bureau, modification des habilitations d'administration.</p>
            </div>
          </div>

          <div className="overflow-x-auto text-slate-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Niveau Habilitation</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 text-xs text-slate-600">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {u.lastName.toUpperCase()} {u.firstName}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === "SUPER_ADMIN" ? "bg-red-50 text-red-700 border border-red-100" :
                        u.role === "BUREAU" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Activity Log journals
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm">Habilitation d'Audit – Journal de Traçabilité</h4>
            <p className="text-xs text-slate-500">Traces d'activité de connexion, édition de trajet et modifications d'affectation.</p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-slate-50 pb-2.5 text-xs hover:bg-slate-50/30 p-1 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-slate-100 font-bold text-slate-700 uppercase">{log.action}</span>
                    <span className="ml-2 font-medium text-slate-700">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{new Date(log.createdAt).toLocaleString("fr-FR")}</span>
                </div>
                {log.user && (
                  <p className="text-[10px] text-slate-450 mt-1 flex items-center space-x-1.5">
                    <UserCheck className="w-3 h-3 text-slate-400 inline" />
                    <span>Auteur: {log.user.firstName} {log.user.lastName} ({log.user.role})</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
