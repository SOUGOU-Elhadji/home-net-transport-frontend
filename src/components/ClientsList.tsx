// frontend/src/components/ClientsList.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Client, Ride } from "../types";
import { Search, UserPlus, CreditCard, Edit, Trash2, ShieldAlert, ChevronRight, X, Phone, MapPin, Eye } from "lucide-react";

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<Ride[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form Modals (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    isPmr: false,
    observations: ""
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/clients");
      setClients(res.data);
      setError(null);
    } catch (err: any) {
      setError("Impossible de charger les clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAddModal = () => {
    setEditClient(null);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      isPmr: false,
      observations: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      isPmr: client.isPmr,
      observations: client.observations || ""
    });
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editClient) {
        await api.put(`/api/clients/${editClient.id}`, formData);
      } else {
        await api.post("/api/clients", formData);
      }
      setIsFormOpen(false);
      fetchClients();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le client "${name}" ?`)) {
      try {
        await api.delete(`/api/clients/${id}`);
        fetchClients();
        if (selectedClient?.id === id) {
          setSelectedClient(null);
        }
      } catch (err: any) {
        alert(err.response?.data?.message || "Erreur de suppression.");
      }
    }
  };

  const handleInspectClient = async (client: Client) => {
    setSelectedClient(client);
    try {
      setLoadingHistory(true);
      const res = await api.get(`/api/clients/${client.id}/history`);
      setClientHistory(res.data);
    } catch (err) {
      setClientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.lastName.toLowerCase().includes(term) ||
      c.firstName.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Panel */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Gestion des Clients</h3>
            <p className="text-xs text-slate-500">Ajoutez, recherchez et gérez les clients de HOME NET Transport</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Client</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom, ville ou téléphone..." 
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Clients Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucun client trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nom & Prénom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Adresse</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Spécif.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {client.lastName.toUpperCase()} {client.firstName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {client.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {client.address}, {client.city} ({client.postalCode})
                    </td>
                    <td className="px-4 py-3 text-center">
                      {client.isPmr ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">PMR</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Std</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        onClick={() => handleInspectClient(client)}
                        className="text-slate-600 hover:text-blue-600 transition p-1"
                        title="Consulter historique"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(client)}
                        className="text-slate-600 hover:text-amber-600 transition p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id, `${client.lastName} ${client.firstName}`)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History and Details Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Profil & Historique</h4>
        
        {selectedClient ? (
          <div className="space-y-4">
            {/* Contact Details */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-2">
              <h5 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                {selectedClient.lastName.toUpperCase()} {selectedClient.firstName}
              </h5>
              <div className="flex items-center text-xs text-slate-600 space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedClient.phone}</span>
              </div>
              <div className="flex items-start text-xs text-slate-600 space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <span>{selectedClient.address}<br />{selectedClient.postalCode} {selectedClient.city}</span>
              </div>
              {selectedClient.observations && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic"><b>Remarques :</b> {selectedClient.observations}</p>
                </div>
              )}
            </div>

            {/* Travel History */}
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trajets Récents</h5>
              {loadingHistory ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></div>
                </div>
              ) : clientHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun trajet dans l'historique.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {clientHistory.map((ride) => (
                    <div key={ride.id} className="border border-slate-100 rounded-lg p-2.5 text-xs hover:border-slate-200 transition bg-slate-50/20">
                      <div className="flex justify-between font-semibold">
                        <span>{ride.rideNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          ride.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          ride.status === "CANCELLED" ? "bg-red-50 text-red-700 border border-red-100" :
                          ride.status === "PLANNED" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-orange-700"
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        Le {ride.date} à {ride.time}
                      </div>
                      <div className="mt-1 flex flex-col gap-0.5 text-slate-600">
                        <span><b>Départ:</b> {ride.departureAddress}</span>
                        <span><b>Arrivée:</b> {ride.arrivalAddress}</span>
                      </div>
                      {ride.chauffeur && (
                        <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          Chauffeur: {ride.chauffeur.firstName} {ride.chauffeur.lastName}
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
            Sélectionnez un client dans la liste pour voir ses données de profil, remarques et son historique complet de trajets.
          </div>
        )}
      </div>

      {/* Creation/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">
                {editClient ? "Modifier le Client" : "Nouveau Client"}
              </h4>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone *</label>
                <input 
                  type="text" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Adresse de résidence *</label>
                <input 
                  type="text" 
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ville *</label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Code Postal *</label>
                  <input 
                    type="text" 
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isPmr"
                  name="isPmr"
                  checked={formData.isPmr}
                  onChange={handleCheckboxChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isPmr" className="text-xs font-semibold text-slate-700">Le client nécessite un véhicule équipé PMR ?</label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observations particulières (pathologie, spécificités)</label>
                <textarea 
                  name="observations"
                  rows={3}
                  value={formData.observations}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={handleCloseModal}
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
