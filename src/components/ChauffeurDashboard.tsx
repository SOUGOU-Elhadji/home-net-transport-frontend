// frontend/src/components/ChauffeurDashboard.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Ride, User } from "../types";
import { LogOut, Calendar, MapPin, CheckCircle2, Navigation, AlertCircle, RefreshCw, ClipboardList, Info } from "lucide-react";

interface ChauffeurDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function ChauffeurDashboard({ user, onLogout }: ChauffeurDashboardProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"upcoming" | "past">("upcoming");

  // Operational modal states
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isMilageModalOpen, setIsMilageModalOpen] = useState(false);
  const [mileageInput, setMileageInput] = useState("");

  const loadChauffeurRides = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/chauffeurs/${user.id}/rides`);
      setRides(res.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la récupération de vos missions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChauffeurRides();
  }, [user.id]);

  const handleStartRide = async (rideId: string) => {
    try {
      await api.put(`/api/trajets/${rideId}`, {
        status: "IN_PROGRESS"
      });
      loadChauffeurRides();
    } catch (err: any) {
      alert("Erreur pour lancer le trajet.");
    }
  };

  const handleOpenCompleteModal = (ride: Ride) => {
    setSelectedRide(ride);
    // Suggest current vehicle mileage as base
    setMileageInput(ride.vehicle ? String(ride.vehicle.mileage + 15) : "15000"); // simulate standard +15 km if undefined
    setIsMilageModalOpen(true);
  };

  const handleConfirmCompleteRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide) return;
    try {
      await api.put(`/api/trajets/${selectedRide.id}`, {
        status: "COMPLETED",
        mileage: Number(mileageInput)
      });
      setIsMilageModalOpen(false);
      setSelectedRide(null);
      loadChauffeurRides();
    } catch (err: any) {
      alert("Erreur de validation de fin de trajet.");
    }
  };

  // Filter chronologically
  const sortedAndFilteredRides = rides.filter(ride => {
    const isPast = ride.status === "COMPLETED" || ride.status === "CANCELLED";
    if (filterMode === "past") return isPast;
    return !isPast;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Banner high contrast header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center font-bold text-white shadow">
            HN
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">HOME NET Transport</h1>
            <p className="text-[10px] text-emerald-500 font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              ESPACE CHAUFFEUR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user.firstName} {user.lastName.toUpperCase()}</p>
            <p className="text-[9px] text-slate-400">License: {user.licenseNumber || "Sans permis"}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-1 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-350 p-2 rounded-lg text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 space-y-5">
        
        {/* Driver greeting & quick summary */}
        <div className="bg-slate-950 border border-slate-855 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Ravi de vous revoir,</p>
            <h3 className="text-base font-bold text-slate-50">{user.firstName}</h3>
          </div>
          <button 
            onClick={loadChauffeurRides}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 gap-2 border border-slate-810 bg-slate-950 p-1 rounded-xl">
          <button 
            onClick={() => setFilterMode("upcoming")}
            className={`text-xs font-bold py-2 rounded-lg transition ${
              filterMode === "upcoming" ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Suivant / En Cours
          </button>
          <button 
            onClick={() => setFilterMode("past")}
            className={`text-xs font-bold py-2 rounded-lg transition ${
              filterMode === "past" ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Historique Terminé
          </button>
        </div>

        {/* Loading & error states */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950 border border-red-900 p-4 rounded-xl flex items-center space-x-2.5 text-xs text-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        ) : sortedAndFilteredRides.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs italic">
            Aucun trajet à afficher pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAndFilteredRides.map((ride) => (
              <div 
                key={ride.id} 
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/60">
                  <div>
                    <span className="bg-indigo-950 text-indigo-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded border border-indigo-900/50">
                      {ride.rideNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2 font-bold">{ride.date}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${
                    ride.status === "COMPLETED" ? "text-emerald-500" :
                    ride.status === "CANCELLED" ? "text-red-500" :
                    ride.status === "IN_PROGRESS" ? "text-orange-500 animate-pulse" : "text-blue-400"
                  }`}>
                    {ride.status === "PLANNED" ? "Planifié" :
                     ride.status === "CONFIRMED" ? "Confirmé" :
                     ride.status === "IN_PROGRESS" ? "En cours de route ➜" :
                     ride.status === "CANCELLED" ? "Annulé" : "Terminé"}
                  </span>
                </div>

                {/* Patient Information */}
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {ride.client ? `${ride.client.lastName.toUpperCase()} ${ride.client.firstName}` : "Patient"}
                  </h4>
                  {ride.client?.isPmr && (
                    <span className="inline-flex text-[9px] bg-blue-950 text-blue-400 border border-blue-900 font-bold px-1.5 py-0.5 rounded mt-1">
                      ♿ PMR - S'assurer de la rampe fauteuil active
                    </span>
                  )}
                </div>

                {/* Road details */}
                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/30">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">Prise en charge à {ride.time}</p>
                      <p className="font-medium text-slate-100">{ride.departureAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 border-t border-slate-800/50 pt-2">
                    <Navigation className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500 font-sans">Destination</p>
                      <p className="font-medium text-slate-100">{ride.arrivalAddress}</p>
                    </div>
                  </div>
                </div>

                {ride.notes && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded text-xs text-amber-300">
                    <b>Consignes:</b> {ride.notes}
                  </div>
                )}

                {ride.vehicle && (
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <ClipboardList className="w-3.5 h-3.5 text-slate-600" />
                    <span>Véhicule assigné : <b>{ride.vehicle.brand} {ride.vehicle.model}</b> ({ride.vehicle.registrationNumber})</span>
                  </div>
                )}

                {/* Action drivers controls */}
                {ride.status !== "COMPLETED" && ride.status !== "CANCELLED" && (
                  <div className="pt-2 flex space-x-2">
                    {ride.status !== "IN_PROGRESS" ? (
                      <button 
                        onClick={() => handleStartRide(ride.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Démarrer la course</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenCompleteModal(ride)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Clôturer (Saisie Kilométrage)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Real Time Mileage submission input modal */}
      {isMilageModalOpen && selectedRide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-slate-100">
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Saisie du Kilométrage Réel</h4>
            </div>

            <form onSubmit={handleConfirmCompleteRide} className="p-4 space-y-4">
              <div className="bg-indigo-950/25 border border-indigo-900/40 p-3 rounded-lg flex items-start space-x-2">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Le chauffeur doit obligatoirement renseigner l'odomètre de fin de trajet pour mettre à jour automatiquement le totalisateur du véhicule {selectedRide.vehicle ? `(${selectedRide.vehicle.brand})` : ""}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Index Kilométrique Actuel *</label>
                <input 
                  type="number" 
                  required
                  placeholder="Ex: 14500"
                  value={mileageInput}
                  onChange={(e) => setMileageInput(e.target.value)}
                  className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2.5 text-base font-mono text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsMilageModalOpen(false); setSelectedRide(null); }}
                  className="w-1/3 bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold text-xs py-2.5 rounded-lg transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="w-2/3 bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md transition"
                >
                  Clôturer la Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
