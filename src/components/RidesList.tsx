// frontend/src/components/RidesList.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Ride, Client, User, Vehicle, RecurringReservation } from "../types";
import { Plus, Search, RefreshCw, Copy, Trash2, Calendar, MapPin, CheckCircle, HelpCircle, UserCheck, Trash, ShieldAlert, ArrowRightLeft } from "lucide-react";

export default function RidesList() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [recurringList, setRecurringList] = useState<RecurringReservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rides" | "recurring">("rides");
  const [searchTerm, setSearchTerm] = useState("");

  // Create Ride Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"simple" | "recurring">("simple");
  const [formData, setFormData] = useState({
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    departureAddress: "",
    arrivalAddress: "",
    chauffeurId: "",
    vehicleId: "",
    isPmr: false,
    notes: "",
    status: "PLANNED",
    isRoundTrip: false, // Aller-Retour
    // Recurring fields
    frequency: "WEEKLY",
    untilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // +30 days
  });

  // const loadData = async () => {
  //   try {
  //     setLoading(true);
  //     const [ridesRes, clientsRes, chauffeursRes, vehiclesRes, recRes] = await Promise.all([
  //       api.get("/api/trajets"),
  //       api.get("/api/clients"),
  //       api.get("/api/chauffeurs"),
  //       api.get("/api/vehicules"),
  //       api.get("/api/trajets/recurring/list")
  //     ]);
  //     setRides(ridesRes.data);
  //     setClients(clientsRes.data);
  //     setChauffeurs(chauffeursRes.data);
  //     setVehicles(vehiclesRes.data);
  //     setRecurringList(recRes.data);
  //   } catch (err) {
  //     console.error("Error loading ride dashboard data:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loadData = async () => {
  try {
    setLoading(true);
    
    // allSettled permet de récupérer les données des requêtes qui réussissent même si certaines échouent
    const results = await Promise.allSettled([
      api.get("/api/trajets"),
      api.get("/api/clients"),
      api.get("/api/chauffeurs"),
      api.get("/api/vehicules"),
      api.get("/api/trajets/recurring/list")
    ]);

    if (results[0].status === "fulfilled") setRides(results[0].value.data);
    if (results[1].status === "fulfilled") setClients(results[1].value.data);
    if (results[2].status === "fulfilled") setChauffeurs(results[2].value.data);
    if (results[3].status === "fulfilled") setVehicles(results[3].value.data);
    if (results[4].status === "fulfilled") setRecurringList(results[4].value.data);

    // Optionnel : afficher dans la console les requêtes qui échouent pour debug
    results.forEach((res, index) => {
      if (res.status === "rejected") {
        console.error(`La requête index ${index} a échoué:`, res.reason);
      }
    });

  } catch (err) {
    console.error("Error loading ride dashboard data:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleClientSelect = (clientId: string) => {
    const matched = clients.find(c => c.id === clientId);
    if (matched) {
      setFormData(prev => ({ 
        ...prev, 
        clientId, 
        isPmr: matched.isPmr,
        departureAddress: matched.address + ", " + matched.city
      }));
    } else {
      setFormData(prev => ({ ...prev, clientId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formType === "simple") {
        await api.post("/api/trajets", formData);
      } else {
        await api.post("/api/trajets/recurring/list", {
          clientId: formData.clientId,
          startRideDate: formData.date,
          startTime: formData.time,
          departureAddress: formData.departureAddress,
          arrivalAddress: formData.arrivalAddress,
          chauffeurId: formData.chauffeurId,
          vehicleId: formData.vehicleId,
          isPmr: formData.isPmr,
          notes: formData.notes,
          frequency: formData.frequency,
          untilDate: formData.untilDate
        });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur de création.");
    }
  };

  const handleStatusChange = async (rideId: string, newStatus: string) => {
    try {
      const match = rides.find(r => r.id === rideId);
      if (!match) return;
      await api.put(`/api/trajets/${rideId}`, {
        ...match,
        status: newStatus
      });
      loadData();
    } catch (err: any) {
      alert("Erreur de mise à jour du statut.");
    }
  };

  const handleDuplicate = async (rideId: string) => {
    try {
      await api.post(`/api/trajets/${rideId}/duplicate`);
      loadData();
    } catch (err: any) {
      alert("Erreur de duplication.");
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (window.confirm("Supprimer définitivement ce trajet ?")) {
      try {
        await api.delete(`/api/trajets/${rideId}`);
        loadData();
      } catch (err: any) {
        alert("Erreur de suppression.");
      }
    }
  };

  const handleDeleteRecurring = async (recId: string) => {
    if (window.confirm("Supprimer cette récurrence ainsi que ses futurs trajets planifiés associés ?")) {
      try {
        await api.delete(`/api/trajets/recurring/list/${recId}`);
        loadData();
      } catch (err: any) {
        alert("Erreur de suppression.");
      }
    }
  };

  const filteredRides = rides.filter(r => {
    const term = searchTerm.toLowerCase();
    const clientName = r.client ? `${r.client.lastName} ${r.client.firstName}`.toLowerCase() : "";
    const driverName = r.chauffeur ? `${r.chauffeur.lastName} ${r.chauffeur.firstName}`.toLowerCase() : "";
    return (
      r.rideNumber.toLowerCase().includes(term) ||
      clientName.includes(term) ||
      driverName.includes(term) ||
      r.departureAddress.toLowerCase().includes(term) ||
      r.arrivalAddress.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ordonnancement des Trajets</h3>
          <p className="text-xs text-slate-500">Planifiez des courses simples, aller-retour, ou des tournées régulières récurrentes.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setFormType("simple");
              setFormData(p => ({ ...p, isRoundTrip: false }));
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-3.5 rounded-lg shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Trajet</span>
          </button>
          <button 
            onClick={() => {
              setFormType("recurring");
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3.5 rounded-lg shadow transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Planifier Récurrence</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("rides")}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === "rides" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Trajets Unitaux ({rides.length})
        </button>
        <button 
          onClick={() => setActiveTab("recurring")}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === "recurring" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Réservations Régulières ({recurringList.length})
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === "rides" ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par n° trajet, client, chauffeur, ville..." 
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Aucun trajet planifié.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-slate-700">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Infos</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date & Horaire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Itinéraire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Équipages</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-semibold text-blue-600">{ride.rideNumber}</div>
                        <div className="text-xs font-bold text-slate-900">
                          {ride.client ? `${ride.client.lastName.toUpperCase()} ${ride.client.firstName}` : "Inconnu"}
                        </div>
                        {ride.isPmr && <span className="inline-flex text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded mt-1">♿ PMR</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="font-semibold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ride.date}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{ride.time}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 space-y-1 max-w-xs">
                        <div className="truncate"><b className="text-[10px] text-indigo-600">DÉP:</b> {ride.departureAddress}</div>
                        <div className="truncate"><b className="text-[10px] text-emerald-600">ARR:</b> {ride.arrivalAddress}</div>
                        {ride.notes && <div className="text-[10px] text-amber-600 italic bg-amber-50 px-1 py-0.5 rounded truncate">Note: {ride.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-slate-900 font-medium">{ride.chauffeur ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName}` : "❌ Non assigné"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{ride.vehicle ? `${ride.vehicle.brand} ${ride.vehicle.model} (${ride.vehicle.registrationNumber})` : "❌ Aucun véhicule"}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select 
                          value={ride.status}
                          onChange={(e) => handleStatusChange(ride.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg border px-2 py-1 bg-white focus:outline-none ${
                            ride.status === "COMPLETED" ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                            ride.status === "CANCELLED" ? "border-red-200 text-red-700 bg-red-50" :
                            ride.status === "IN_PROGRESS" ? "border-orange-200 text-orange-700 bg-orange-50" :
                            ride.status === "CONFIRMED" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-700"
                          }`}
                        >
                          <option value="PLANNED">Planifié</option>
                          <option value="CONFIRMED">Confirmé</option>
                          <option value="IN_PROGRESS">En Cours</option>
                          <option value="COMPLETED">Terminé</option>
                          <option value="CANCELLED">Annulé</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          onClick={() => handleDuplicate(ride.id)}
                          className="text-slate-500 hover:text-blue-600 p-1"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRide(ride.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Supprimer"
                        >
                          <Trash className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Repeating bookings tab view
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Réservations récurrentes actives</h4>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : recurringList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Aucune récurrence périodique programmée.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurringList.map((rec) => (
                <div key={rec.id} className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs bg-slate-50/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900">
                        {rec.client ? `${rec.client.lastName.toUpperCase()} ${rec.client.firstName}` : "Client inconnu"}
                      </h5>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 mt-1">
                        Récurrence: {rec.frequency === "DAILY" ? "Quotienne" : rec.frequency === "WEEKLY" ? "Hebdomadaire" : "Mensuelle"}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteRecurring(rec.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition"
                      title="Supprimer récurrence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div><b>Rond-point horaire :</b> à {rec.startTime}</div>
                    <div className="bg-white p-2 rounded border border-slate-100 mt-2 space-y-0.5">
                      <div className="truncate"><b>Départ:</b> {rec.departureAddress}</div>
                      <div className="truncate"><b>Arrivée:</b> {rec.arrivalAddress}</div>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400">
                      Généré du {rec.startRideDate} jusqu'au {rec.untilDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Ride / Recurrence Dialog forms */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                <span>{formType === "simple" ? "Planifier un nouveau Trajet" : "Créer une Convention de Récurrence"}</span>
              </h4>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Trash className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sélectionner Client *</label>
                <select 
                  name="clientId"
                  required
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                >
                  <option value="">-- Choisissez le Client bénéficiaire --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.lastName.toUpperCase()} {c.firstName} {c.isPmr ? "(♿ PMR)" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {formType === "simple" ? "Date de Course *" : "Date Initiale de Recurrence *"}
                  </label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Heure de Prise en Charge *</label>
                  <input 
                    type="time" 
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Adresse de départ *</label>
                  <input 
                    type="text" 
                    name="departureAddress"
                    required
                    value={formData.departureAddress}
                    onChange={handleInputChange}
                    placeholder="Adresse, Ville, CP"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Adresse d'arrivée (Clinique, Ecole, Club...) *</label>
                  <input 
                    type="text" 
                    name="arrivalAddress"
                    required
                    value={formData.arrivalAddress}
                    onChange={handleInputChange}
                    placeholder="Adresse, Clinique de l'Alma, etc"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
                  />
                </div>
              </div>

              {/* Equipe assign */}
              <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Attribuer Chauffeur (Optionnel)</label>
                  <select 
                    name="chauffeurId"
                    value={formData.chauffeurId}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Non Affecté (Standby Bureau) --</option>
                    {chauffeurs.filter(c => c.status === "ACTIVE").map(c => (
                      <option key={c.id} value={c.id}>{c.lastName.toUpperCase()} {c.firstName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Attribuer Véhicule de Flotte</label>
                  <select 
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Non affecté --</option>
                    {vehicles.filter(v => v.status === "AVAILABLE").map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registrationNumber}) [{v.type}]</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PMR / Comments */}
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isPmrForm"
                  name="isPmr"
                  checked={formData.isPmr}
                  onChange={handleCheckboxChange}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <label htmlFor="isPmrForm" className="text-xs font-semibold text-slate-700">Véhicule PMR Requis ?</label>
              </div>

              {formType === "simple" && (
                <div className="flex items-center space-x-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                  <input 
                    type="checkbox" 
                    id="isRoundTrip"
                    name="isRoundTrip"
                    checked={formData.isRoundTrip}
                    onChange={handleCheckboxChange}
                    className="rounded border-slate-300 text-blue-600 w-4 h-4"
                  />
                  <label htmlFor="isRoundTrip" className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                    <span>Créer également le trajet retour inverse automatiquement (+3h de battement) ?</span>
                  </label>
                </div>
              )}

              {/* Recurring schedule options */}
              {formType === "recurring" && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg space-y-3">
                  <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Plan de Répétition</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-700">Fréquence de Passage *</label>
                      <select 
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleInputChange}
                        className="w-full border border-indigo-200 bg-white rounded-lg p-1.5 text-xs text-slate-900"
                      >
                        <option value="DAILY">Chaque jour (Quotidien)</option>
                        <option value="WEEKLY">Chaque semaine (Hebdomadaire)</option>
                        <option value="MONTHLY">Chaque mois (Mensuel)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-700">Générer jusqu'au (Date Butoir) *</label>
                      <input 
                        type="date" 
                        name="untilDate"
                        required
                        value={formData.untilDate}
                        onChange={handleInputChange}
                        className="w-full border border-indigo-200 bg-white rounded-lg p-1.5 text-xs text-slate-900" 
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-indigo-600/80 italic">Note: Le système calculera et créera automatiquement tous les trajets individuels compris dans cette période.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Consignes & Remarques (bagages, accompagnateur...)</label>
                <textarea 
                  name="notes"
                  rows={2}
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900" 
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-2 px-4 rounded-lg transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
                >
                  Confirmer et Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
