// frontend/src/components/RapportsView.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { FileText, Download, Calendar, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from "recharts";

export default function RapportsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: "2026-06-01",
    end: "2026-06-30"
  });

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/reports/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExport = (type: "pdf" | "excel", reportName: string) => {
    alert(`Export du rapport "${reportName}" au format ${type.toUpperCase()} généré avec succès (Simulé).`);
  };

  const getStatusLabelFr = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Terminés";
      case "CANCELLED": return "Annulés";
      case "IN_PROGRESS": return "En cours";
      default: return "Planifiés";
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Centre de Rapports HOME NET</h3>
          <p className="text-xs text-slate-500">Examinez le volume de trajet, le rendement kilométrique et l'activité des chauffeurs.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border border-slate-200 p-1.5 rounded-lg text-slate-705 bg-white font-medium" 
          />
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border border-slate-200 p-1.5 rounded-lg text-slate-705 bg-white font-medium" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !stats ? (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100">
          Impossible de récupérer les statistiques compilées pour cette période.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Trajets par période */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Volume de trajets par période</h4>
                <p className="text-xs text-slate-400">Totalité des courses classées par statut</p>
              </div>
              <div className="space-x-1">
                <button onClick={() => handleExport("pdf", "Trajets")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-blue-600 text-xs font-semibold">PDF</button>
                <button onClick={() => handleExport("excel", "Trajets")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-emerald-600 text-xs font-semibold">Excel</button>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.evolutionTrajets}>
                  <defs>
                    <linearGradient id="linesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" name="Total courses" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Courses complétées" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 2: Chiffre d'Affaires */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Rapport Financier & Évolutions CA</h4>
                <p className="text-xs text-slate-400">Période du {dateRange.start} au {dateRange.end}</p>
              </div>
              <div className="space-x-1">
                <button onClick={() => handleExport("pdf", "CA")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-blue-600 text-xs font-semibold">PDF</button>
                <button onClick={() => handleExport("excel", "CA")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-emerald-600 text-xs font-semibold">Excel</button>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.evolutionRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar name="Rendement € (brut)" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Véhicules et kilométrages */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Utilisation & Kilométrage Véhicules</h4>
                <p className="text-xs text-slate-400">Kilométrage total parcouru par immatriculation</p>
              </div>
              <button onClick={() => handleExport("pdf", "Flotte")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-blue-600 text-xs font-semibold">Export PDF</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {stats.utilisationVehicules && stats.utilisationVehicules.map((v: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2.5 last:border-none last:pb-0">
                  <div>
                    <p className="font-bold text-slate-800">{v.name}</p>
                    <p className="text-[10px] text-slate-400">Plates : {v.immatriculation}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{v.mileage || 0} km</p>
                    <p className="text-[10px] text-indigo-500">{v.ridesCount || 0} trajet(s) effectué(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Drivers activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Chauffeurs les plus Actifs</h4>
                <p className="text-xs text-slate-400">Statistiques d'attribution nominative</p>
              </div>
              <button onClick={() => handleExport("excel", "Chauffeurs")} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-emerald-600 text-xs font-semibold">Export Excel</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {stats.topChauffeurs && stats.topChauffeurs.map((c: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2.5 last:border-none last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700">{idx+1}</span>
                    <p className="font-bold text-slate-800">{c.name}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800">
                    {c.ridesCount || 0} missions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
