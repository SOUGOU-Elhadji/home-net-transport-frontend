// frontend/src/components/PlanningView.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Ride, User, Vehicle, Client } from "../types";
import { Calendar, UserCheck, Truck, ShieldAlert, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function PlanningView() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filterChauffeur, setFilterChauffeur] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [currentDateOffset, setCurrentDateOffset] = useState(0); // Offset in days/weeks

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      const [r, c, v, cl] = await Promise.all([
        api.get("/api/trajets"),
        api.get("/api/chauffeurs"),
        api.get("/api/vehicules"),
        api.get("/api/clients")
      ]);
      setRides(r.data);
      setChauffeurs(c.data);
      setVehicles(v.data);
      setClients(cl.data);
    } catch (err) {
      console.error("Error loading planning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanningData();
  }, []);

  // Format status colors
  const getRideColorStyles = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/50"; // Vert = Terminé
      case "IN_PROGRESS":
        return "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100/50"; // Orange = En cours
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-200 hover:bg-red-100/50"; // Rouge = Annulé
      case "CONFIRMED":
      case "PLANNED":
      default:
        return "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/50"; // Bleu = Planifié / Confirmé
    }
  };

  // Filter rides based on selection
  const filteredRides = rides.filter(ride => {
    let matches = true;
    if (filterChauffeur && ride.chauffeurId !== filterChauffeur) matches = false;
    if (filterVehicle && ride.vehicleId !== filterVehicle) matches = false;
    if (filterClient && ride.clientId !== filterClient) matches = false;
    return matches;
  });

  // Calculate dates based on current view offset
  const getPlanningDates = () => {
    const dates = [];
    const baseDate = new Date();
    
    if (viewMode === "day") {
      baseDate.setDate(baseDate.getDate() + currentDateOffset);
      dates.push(new Date(baseDate));
    } else if (viewMode === "week") {
      // Find Monday of the current week
      const currentDay = baseDate.getDay();
      const distance = (currentDay === 0 ? -6 : 1) - currentDay; // Distance to Monday
      baseDate.setDate(baseDate.getDate() + distance + (currentDateOffset * 7));
      
      for (let i = 0; i < 7; i++) {
        const nextDay = new Date(baseDate);
        nextDay.setDate(baseDate.getDate() + i);
        dates.push(nextDay);
      }
    } else {
      // Month
      baseDate.setMonth(baseDate.getMonth() + currentDateOffset);
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const numDays = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= numDays; i++) {
        dates.push(new Date(year, month, i));
      }
    }
    return dates;
  };

  const datesToRender = getPlanningDates();

  const handleNext = () => setCurrentDateOffset(prev => prev + 1);
  const handlePrev = () => setCurrentDateOffset(prev => prev - 1);
  const handleToday = () => setCurrentDateOffset(0);

  const getWeekName = (dayIdx: number) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[dayIdx];
  };

  const getMonthName = (monthIdx: number) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[monthIdx];
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center space-x-1 text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 p-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          {/* Chauffeur selection */}
          <select 
            value={filterChauffeur} 
            onChange={(e) => setFilterChauffeur(e.target.value)}
            className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="">-- Tous les Chauffeurs --</option>
            {chauffeurs.map(c => (
              <option key={c.id} value={c.id}>{c.lastName.toUpperCase()} {c.firstName}</option>
            ))}
          </select>

          {/* Vehicule selection */}
          <select 
            value={filterVehicle} 
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="">-- Tous les Véhicules --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registrationNumber})</option>
            ))}
          </select>

          {/* Client selection */}
          <select 
            value={filterClient} 
            onChange={(e) => setFilterClient(e.target.value)}
            className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="">-- Tous les Clients --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.lastName.toUpperCase()} {c.firstName}</option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="border border-slate-200 rounded-lg p-1 bg-slate-50 flex items-center space-x-1">
          <button 
            onClick={() => { setViewMode("day"); handleToday(); }}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${
              viewMode === "day" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-850"
            }`}
          >
            Jour
          </button>
          <button 
            onClick={() => { setViewMode("week"); handleToday(); }}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${
              viewMode === "week" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-850"
            }`}
          >
            Semaine
          </button>
          <button 
            onClick={() => { setViewMode("month"); handleToday(); }}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${
              viewMode === "month" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-850"
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Interactive Calendar Board */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Navigation title control */}
        <div className="border-b border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-bold text-slate-800 text-sm md:text-base capitalize">
              {viewMode === "day" && `${getWeekName(datesToRender[0]?.getDay() || 0)} ${datesToRender[0]?.getDate()} ${getMonthName(datesToRender[0]?.getMonth() || 0)} ${datesToRender[0]?.getFullYear()}`}
              {viewMode === "week" && `Semaine du ${datesToRender[0]?.getDate()} ${getMonthName(datesToRender[0]?.getMonth() || 0)} au ${datesToRender[6]?.getDate()} ${getMonthName(datesToRender[6]?.getMonth() || 0)} ${datesToRender[6]?.getFullYear()}`}
              {viewMode === "month" && `${getMonthName(datesToRender[0]?.getMonth() || 0)} ${datesToRender[0]?.getFullYear()}`}
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev} 
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToday} 
              className="px-3 py-1 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700"
            >
              Aujourd'hui
            </button>
            <button 
              onClick={handleNext} 
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-4">
            {viewMode === "day" ? (
              // Daily hourly schedule
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Courses du jour</h5>
                {filteredRides.filter(r => r.date === datesToRender[0]?.toISOString().split("T")[0]).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    Aucune mission planifiée pour ce jour.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRides.filter(r => r.date === datesToRender[0]?.toISOString().split("T")[0]).map(ride => (
                      <div 
                        key={ride.id}
                        className={`p-4 border rounded-xl shadow-xs transition ${getRideColorStyles(ride.status)}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm">{ride.rideNumber}</span>
                          <span className="text-xs font-medium">{ride.time}</span>
                        </div>
                        <h6 className="font-bold mt-2 text-sm">
                          {ride.client ? `${ride.client.lastName.toUpperCase()} ${ride.client.firstName}` : "Client inconnu"}
                        </h6>
                        <div className="text-xs mt-2 space-y-1">
                          <div className="truncate opacity-90"><b>Dép:</b> {ride.departureAddress}</div>
                          <div className="truncate opacity-90"><b>Arr:</b> {ride.arrivalAddress}</div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-200/50 flex justify-between items-center text-[11px] opacity-80">
                          <span className="truncate max-w-[120px]">🚖 {ride.chauffeur ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName.substring(0, 1)}.` : "Non assigné"}</span>
                          <span className="truncate max-w-[120px]">🚗 {ride.vehicle ? ride.vehicle.registrationNumber : "Pas affecté"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : viewMode === "week" ? (
              // Weekly calendar columns (Mon - Sun)
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {datesToRender.map((dateObj, i) => {
                  const dayStr = dateObj.toISOString().split("T")[0];
                  const dayRides = filteredRides.filter(r => r.date === dayStr);
                  const isCurrentToday = new Date().toISOString().split("T")[0] === dayStr;

                  return (
                    <div 
                      key={i} 
                      className={`border rounded-xl p-3 min-h-[300px] flex flex-col space-y-2.5 transition-colors ${
                        isCurrentToday ? "bg-blue-50/40 border-blue-200" : "bg-slate-50/30 border-slate-100"
                      }`}
                    >
                      <div className="border-b border-slate-100 pb-2 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {getWeekName(dateObj.getDay()).substring(0, 3)}
                        </p>
                        <p className={`text-base font-extrabold h-7 w-7 rounded-full flex items-center justify-center mx-auto mt-0.5 ${
                          isCurrentToday ? "bg-blue-600 text-white" : "text-slate-800"
                        }`}>
                          {dateObj.getDate()}
                        </p>
                      </div>

                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[350px] pr-0.5">
                        {dayRides.length === 0 ? (
                          <div className="text-center py-6 text-[10px] text-slate-400 italic">Vide</div>
                        ) : (
                          dayRides.map(ride => (
                            <div 
                              key={ride.id}
                              className={`p-2.5 border rounded-lg shadow-2xs text-[11px] transition duration-200 cursor-pointer ${getRideColorStyles(ride.status)}`}
                              title={`Trajet ${ride.rideNumber} - ${ride.time}`}
                            >
                              <div className="flex justify-between font-bold">
                                <span>{ride.time}</span>
                                <span className="text-[9px] font-mono">{ride.rideNumber}</span>
                              </div>
                              <div className="font-bold truncate mt-1">
                                {ride.client ? `${ride.client.lastName.toUpperCase()}` : "N/A"}
                              </div>
                              <div className="truncate text-[10px] mt-1 opacity-80" title={ride.arrivalAddress}>➜ {ride.arrivalAddress.split(",")[0]}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Monthly overview list view (highly organized)
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aperçu chronologique mensuel</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {datesToRender.map((dateObj, i) => {
                    const dayStr = dateObj.toISOString().split("T")[0];
                    const dayRides = filteredRides.filter(r => r.date === dayStr);
                    if (dayRides.length === 0) return null; // Only show active days

                    return (
                      <div key={i} className="border border-slate-100 p-3 rounded-lg shadow-2xs space-y-2 bg-slate-50/20">
                        <div className="font-bold text-xs text-slate-450 border-b border-slate-100 pb-1 flex justify-between">
                          <span>{getWeekName(dateObj.getDay())} {dateObj.getDate()}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-600">{dayRides.length} course(s)</span>
                        </div>
                        <div className="space-y-1.5">
                          {dayRides.map(ride => (
                            <div key={ride.id} className={`p-1.5 rounded border text-[10px] flex justify-between items-center ${getRideColorStyles(ride.status)}`}>
                              <span className="font-bold">{ride.time}</span>
                              <span className="truncate max-w-[80px] font-medium">{ride.client ? ride.client.lastName : "N/A"}</span>
                              <span className="text-[9px] uppercase font-mono opacity-80">{ride.status.substring(0, 4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend Block */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-center text-xs text-slate-600 font-semibold shadow-2xs">
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block border border-blue-500"></span>
          <span>Planifié / Confirmé</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-orange-500 inline-block border border-orange-500"></span>
          <span>En Cours</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block border border-emerald-500"></span>
          <span>Terminé</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-500 inline-block border border-red-500"></span>
          <span>Annulé</span>
        </span>
      </div>
    </div>
  );
}
