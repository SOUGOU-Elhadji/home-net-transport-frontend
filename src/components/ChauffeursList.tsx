// frontend/src/components/ChauffeursList.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { User, Ride } from "../types";
import { Search, UserPlus, ShieldAlert, Edit, X, Calendar, Phone, Mail, Award } from "lucide-react";

export default function ChauffeursList() {
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail & Assinged rides
  const [selectedChauffeur, setSelectedChauffeur] = useState<User | null>(null);
  const [assignedRides, setAssignedRides] = useState<Ride[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  // Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editChauffeur, setEditChauffeur] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    status: "ACTIVE",
    password: ""
  });

  const fetchChauffeurs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/chauffeurs");
      setChauffeurs(res.data);
      setError(null);
    } catch (err: any) {
      setError("Impossible de charger les chauffeurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const handleOpenAddModal = () => {
    setEditChauffeur(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "ACTIVE",
      password: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (chauffeur: User) => {
    setEditChauffeur(chauffeur);
    setFormData({
      firstName: chauffeur.firstName,
      lastName: chauffeur.lastName,
      email: chauffeur.email,
      phone: chauffeur.phone || "",
      licenseNumber: chauffeur.licenseNumber || "",
      licenseExpiry: chauffeur.licenseExpiry || "",
      status: chauffeur.status,
      password: "" // Optional for edit
    });
    setIsFormOpen(true);
  };

  const handleInspectChauffeur = async (chauffeur: User) => {
    setSelectedChauffeur(chauffeur);
    try {
      setLoadingRides(true);
      const res = await api.get(`/api/chauffeurs/${chauffeur.id}/rides`);
      setAssignedRides(res.data);
    } catch (err) {
      setAssignedRides([]);
    } finally {
      setLoadingRides(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editChauffeur) {
        await api.put(`/api/chauffeurs/${editChauffeur.id}`, formData);
      } else {
        await api.post("/api/chauffeurs", formData);
      }
      setIsFormOpen(false);
      fetchChauffeurs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur de sauvegarde.");
    }
  };

  const filteredChauffeurs = chauffeurs.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.lastName.toLowerCase().includes(term) ||
      c.firstName.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      c.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Driver List */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Suivi des Chauffeurs</h3>
            <p className="text-xs text-slate-500">Gérez le personnel navigant, les numéros de permis et la disponibilité.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Chauffeur</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, téléphone..." 
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
        ) : filteredChauffeurs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucun chauffeur inscrit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Chauffeur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Permis & Expiry</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChauffeurs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {c.lastName.toUpperCase()} {c.firstName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div className="text-slate-900">{c.phone || "Non renseigné"}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div className="font-mono text-xs">{c.licenseNumber || "N/A"}</div>
                      {c.licenseExpiry && <div className="text-xs text-slate-400">Expire le: {c.licenseExpiry}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.status === "ACTIVE" ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Disponible</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Inactif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        onClick={() => handleInspectChauffeur(c)}
                        className="text-slate-600 hover:text-blue-600 font-medium text-xs border border-slate-200 hover:bg-slate-50 rounded px-2.5 py-1 transition"
                      >
                        Consulter Trajets
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(c)}
                        className="text-slate-600 hover:text-amber-600 transition p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Driver specific Schedule sidebar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Agenda Affectations</h4>
        
        {selectedChauffeur ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
              <h5 className="text-sm font-semibold text-slate-800">
                {selectedChauffeur.lastName.toUpperCase()} {selectedChauffeur.firstName}
              </h5>
              <div className="flex items-center text-xs text-slate-600 space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedChauffeur.phone || "N/A"}</span>
              </div>
              <div className="flex items-center text-xs text-slate-600 space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedChauffeur.email}</span>
              </div>
              {selectedChauffeur.licenseNumber && (
                <div className="flex items-center text-xs text-slate-500 space-x-2 pt-1">
                  <Award className="w-3.5 h-3.5 text-slate-450" />
                  <span>Permis: {selectedChauffeur.licenseNumber} (Exp. {selectedChauffeur.licenseExpiry})</span>
                </div>
              )}
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trajets Assignés</h5>
              {loadingRides ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></div>
                </div>
              ) : assignedRides.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun trajet assigné.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {assignedRides.map((ride) => (
                    <div key={ride.id} className="border border-slate-100 rounded-lg p-2.5 text-xs hover:border-slate-200 transition bg-slate-50/30">
                      <div className="flex justify-between font-semibold">
                        <span>{ride.rideNumber}</span>
                        <span className={`px-1 rounded text-[9px] ${
                          ride.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                          ride.status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">Le {ride.date} à {ride.time}</div>
                      <div className="mt-1 font-medium">{ride.client ? `${ride.client.lastName} ${ride.client.firstName}` : "Client inconnu"}</div>
                      <div className="text-slate-600 mt-1">
                        <b>Départ:</b> {ride.departureAddress}<br />
                        <b>Arrivée:</b> {ride.arrivalAddress}
                      </div>
                      {ride.vehicle && (
                        <div className="mt-1 bg-slate-100/50 px-1.5 py-0.5 rounded text-[10px] text-slate-500 inline-block">
                          Véhicule: {ride.vehicle.brand} {ride.vehicle.model}
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
            Sélectionnez un chauffeur pour voir ses informations de contact et charger ses trajets assignés de la semaine.
          </div>
        )}
      </div>

      {/* Creation Modal form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">
                {editChauffeur ? "Modifier Chauffeur" : "Nouveau Chauffeur"}
              </h4>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prénom *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nom *</label>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              </div>

              {!editChauffeur && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mot de Passe Initial *</label>
                  <input 
                    type="password" 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Numéro de Permis</label>
                  <input 
                    type="text" 
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date Expiration Permis</label>
                  <input 
                    type="date" 
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Statut Initial</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                >
                  <option value="ACTIVE">Disponible (Actif)</option>
                  <option value="INACTIVE">Désactivé (Inactif/Congé)</option>
                </select>
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
