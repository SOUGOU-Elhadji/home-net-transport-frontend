// frontend/src/components/VehiclesList.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Vehicle, Ride } from "../types";
import { Search, Plus, ShieldAlert, Edit, Trash2, X, AlertTriangle, ShieldCheck, Wrench, Route } from "lucide-react";

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<Ride[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    brand: "",
    model: "",
    type: "Standard",
    mileage: 0,
    insuranceDate: "",
    technicalInspectionDate: "",
    status: "AVAILABLE"
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/vehicules");
      setVehicles(res.data);
      setError(null);
    } catch (err: any) {
      setError("Impossible de charger le parc de véhicules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setEditVehicle(null);
    setFormData({
      registrationNumber: "",
      brand: "",
      model: "",
      type: "Standard",
      mileage: 0,
      insuranceDate: "",
      technicalInspectionDate: "",
      status: "AVAILABLE"
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      mileage: vehicle.mileage,
      insuranceDate: vehicle.insuranceDate,
      technicalInspectionDate: vehicle.technicalInspectionDate,
      status: vehicle.status
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editVehicle) {
        await api.put(`/api/vehicules/${editVehicle.id}`, formData);
      } else {
        await api.post("/api/vehicules", formData);
      }
      setIsFormOpen(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur de sauvegarde.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Supprimer le véhicule "${name}" du parc ?`)) {
      try {
        await api.delete(`/api/vehicules/${id}`);
        fetchVehicles();
        if (selectedVehicle?.id === id) setSelectedVehicle(null);
      } catch (err: any) {
        alert(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleInspectVehicle = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    try {
      setLoadingHistory(true);
      const res = await api.get(`/api/vehicules/${vehicle.id}/history`);
      setVehicleHistory(res.data);
    } catch (err) {
      setVehicleHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase();
    return (
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.registrationNumber.toLowerCase().includes(term) ||
      v.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fleet Panel */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Parc Automobile</h3>
            <p className="text-xs text-slate-500">Missions d'entretien, assurances, contrôle technique et attribution.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Véhicule</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par marque, modèle, plaque ou type..." 
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucun véhicule enregistré.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                onClick={() => handleInspectVehicle(vehicle)}
                className={`border p-4 rounded-xl cursor-pointer hover:border-blue-300 transition-colors bg-slate-50/10 ${
                  selectedVehicle?.id === vehicle.id ? "border-blue-500 bg-blue-50/5" : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {vehicle.registrationNumber}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-2 text-sm">
                      {vehicle.brand} {vehicle.model}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Carrosserie: {vehicle.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    vehicle.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100" :
                    vehicle.status === "IN_SERVICE" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                    "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {vehicle.status === "AVAILABLE" ? "Disponible" :
                     vehicle.status === "IN_SERVICE" ? "En Trajet" : "Maintenance"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <p className="text-slate-400">Kilométrage</p>
                    <p className="font-semibold text-slate-800">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Type de Véhicule</p>
                    <p className="font-semibold text-slate-800">{vehicle.type === "PMR" ? "Équipé PMR ♿" : "Standard"}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end space-x-2 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(vehicle);
                    }}
                    className="text-slate-600 hover:text-amber-600 transition p-1 text-xs"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 inline" /> Modifier
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`);
                    }}
                    className="text-slate-400 hover:text-red-600 transition p-1 text-xs"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 inline" /> Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicle specific schedule side plan */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Calendrier d'Entretien</h4>
        
        {selectedVehicle ? (
          <div className="space-y-5">
            {/* Compliance details */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contrôles réglementaires</h5>
              
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Contrôle Technique</p>
                    <p className="text-slate-400">Échéance de passage</p>
                  </div>
                </div>
                <span className="font-bold text-slate-700">{selectedVehicle.technicalInspectionDate}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Police d'Assurance</p>
                    <p className="text-slate-400">Renouvellement contrat</p>
                  </div>
                </div>
                <span className="font-bold text-slate-700">{selectedVehicle.insuranceDate}</span>
              </div>
            </div>

            {/* Travel list */}
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Historique d'Utilisation</h5>
              {loadingHistory ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></div>
                </div>
              ) : vehicleHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun trajet historique assigné à cette machine.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {vehicleHistory.map((ride) => (
                    <div key={ride.id} className="border border-slate-100 rounded-lg p-2.5 text-xs hover:border-slate-200 transition bg-slate-50/20">
                      <div className="flex justify-between font-semibold">
                        <span>{ride.rideNumber}</span>
                        <span className="px-1 bg-slate-100 text-slate-600 rounded text-[9px]">
                          {ride.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">Le {ride.date} à {ride.time}</div>
                      <div className="mt-1 font-semibold">{ride.client ? `${ride.client.lastName} ${ride.client.firstName}` : "Client inconnu"}</div>
                      <div className="text-slate-600 mt-1">
                        <b>Parcours:</b> {ride.departureAddress} ➜ {ride.arrivalAddress}
                      </div>
                      {ride.chauffeur && (
                        <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-400">
                          <Route className="w-3 h-3" />
                          <span>Chauffeur: {ride.chauffeur.firstName} {ride.chauffeur.lastName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs italic">
            Sélectionnez un véhicule dans la mosaïque pour visionner ses détails d'assurance, contrôle technique et liste d'exploitation.
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">
                {editVehicle ? "Modifier Véhicule" : "Nouveau Véhicule"}
              </h4>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Immatriculation (Plaque) *</label>
                  <input 
                    type="text" 
                    name="registrationNumber"
                    required
                    placeholder="AA-123-BB"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type de Véhicule *</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                  >
                    <option value="Standard">Standard (Berline/SUV)</option>
                    <option value="PMR">Équipé PMR ♿ (Fauteuil d'accès)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Marque *</label>
                  <input 
                    type="text" 
                    name="brand"
                    required
                    placeholder="Ford, Renault, Toyota"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Modèle *</label>
                  <input 
                    type="text" 
                    name="model"
                    required
                    placeholder="Transit Custom, Rifter"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kilométrage Actuel *</label>
                  <input 
                    type="number" 
                    name="mileage"
                    required
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Statut Initial</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                  >
                    <option value="AVAILABLE">Disponible (Au Garage)</option>
                    <option value="IN_SERVICE">En Service / Mission</option>
                    <option value="MAINTENANCE">En Révision / Panne</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Visite Contrôle Technique *</label>
                  <input 
                    type="date" 
                    name="technicalInspectionDate"
                    required
                    value={formData.technicalInspectionDate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Échéance Assurance *</label>
                  <input 
                    type="date" 
                    name="insuranceDate"
                    required
                    value={formData.insuranceDate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
