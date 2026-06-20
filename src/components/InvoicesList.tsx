// frontend/src/components/InvoicesList.tsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Invoice, Client, Ride } from "../types";
import { Plus, Search, FileText, Printer, CheckCircle, Trash, X, ShieldAlert, Download, DollarSign } from "lucide-react";

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [billingMode, setBillingMode] = useState<"unit" | "monthly">("unit");
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    status: "UNPAID",
    rideId: "",
    month: "2026-06",
    date: new Date().toISOString().split("T")[0]
  });

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [inv, cl, rd] = await Promise.all([
        api.get("/api/factures"),
        api.get("/api/clients"),
        api.get("/api/trajets")
      ]);
      setInvoices(inv.data);
      setClients(cl.data);
      setRides(rd.data);
    } catch (err) {
      console.error("Error loading invoices data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    // If monthly billing, default amount can be computed from client completed rides
    const clientCompletedRides = rides.filter(r => r.clientId === clientId && r.status === "COMPLETED");
    // Standard simulation: 35Fcfa per completed ride
    const computedSum = clientCompletedRides.length * 35;
    
    setFormData(prev => ({ 
      ...prev, 
      clientId,
      amount: computedSum > 0 ? String(computedSum) : "45.0" // default fallback
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/factures", formData);
      setIsFormOpen(false);
      loadBillingData();
    } catch (err: any) {
      alert("Erreur lors de la création de la facture.");
    }
  };

  const handleTogglePayment = async (invoiceId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
      await api.put(`/api/factures/${invoiceId}/status`, { status: nextStatus });
      loadBillingData();
    } catch (err) {
      alert("Erreur de paiement.");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm("Supprimer cette facture définitivement ?")) {
      try {
        await api.delete(`/api/factures/${invoiceId}`);
        loadBillingData();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Simulate Export & PDF Generation
  const handleSimulatePDF = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les fenêtres contextuelles pour imprimer.");
      return;
    }

    const htmlContent = `
      <html>
      <head>
        <title>FACTURE ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: sans-serif; color: #1e293b; padding: 40px; }
          .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #1d4ed8; }
          .meta { font-size: 14px; line-height: 1.6; text-align: right; }
          .client-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #f1f5f9; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .table th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 13px; }
          .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { text-align: right; font-size: 16px; font-weight: bold; }
          .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div>
            <div class="title">HOME NET Transport</div>
            <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Service de Transport Médical & PMR Professionnel<br/>Vélizy-Villacoublay, France</p>
          </div>
          <div class="meta">
            <strong>Facture n°: ${invoice.invoiceNumber}</strong><br/>
            Date d'émission: ${invoice.date}<br/>
            Statut: <strong>${invoice.status === "PAID" ? "PAYÉE" : "À PAYER"}</strong>
          </div>
        </div>

        <div class="client-box">
          <strong>FACTURÉ À :</strong><br/>
          ${invoice.client ? `${invoice.client.lastName.toUpperCase()} ${invoice.client.firstName}` : "N/A"}<br/>
          Téléphone: ${invoice.client ? invoice.client.phone : "N/A"}<br/>
          Code Client: CLI-${invoice.clientId.substring(0,6)}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Désignation des prestations de transport</th>
              <th>Période</th>
              <th style="text-align: right;">Montant H.T</th>
              <th style="text-align: right;">TVA (10%)</th>
              <th style="text-align: right;">Total T.T.C</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prestation d'accompagnement de transport sanitaire PMR</td>
              <td>${invoice.month || "Prestation unitaire"}</td>
              <td style="text-align: right;">${(invoice.amount * 0.9).toFixed(0)} Fcfa</td>
              <td style="text-align: right;">${(invoice.amount * 0.1).toFixed(0)} Fcfa</td>
              <td style="text-align: right; font-weight: bold;">${invoice.amount.toFixed(0)} Fcfa</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          Montant Net à Payer : ${invoice.amount.toFixed(0)} Fcfa (TTC)
        </div>

        <div class="footer">
          HOME NET Transport S.A.S.U – SIRET 881 772 901 00012 – Code APE 4939B<br/>
          En cas de retard de paiement, une pénalité de 3 fois le taux d’intérêt légal sera appliquée.
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    alert("Export de la liste de facturation (Excel) généré dans vos téléchargements (Simulé).");
  };

  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const clientName = inv.client ? `${inv.client.lastName} ${inv.client.firstName}`.toLowerCase() : "";
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      clientName.includes(term)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Invoice view */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Factures & Encaissements</h3>
            <p className="text-xs text-slate-500">Consolidez les trajets terminés en facturation mensuelle globale ou unitaire.</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-4 rounded-lg shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Générer Facture</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium text-xs py-2 px-4 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par numéro de facture ou client..." 
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucun historique de facturation trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Facture N°</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client Facturé</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Période Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Montant TTC</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Règlement</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-semibold">
                      {inv.client ? `${inv.client.lastName.toUpperCase()} ${inv.client.firstName}` : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div>{inv.date}</div>
                      {inv.month && <div className="text-[10px] text-slate-400">{inv.month} (Mensuel)</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-slate-950">
                      {inv.amount.toFixed(0)} Fcfa
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePayment(inv.id, inv.status)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border transition ${
                          inv.status === "PAID" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.status === "PAID" ? "Payée" : "À Payer"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        onClick={() => handleSimulatePDF(inv)}
                        className="text-slate-500 hover:text-blue-600 p-1"
                        title="Imprimer PDF"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(inv.id)}
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

      {/* Quick summaries widgets on side */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Statistiques de Caisse</h4>
        
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wide">CA Total Émis</p>
              <h5 className="text-lg font-extrabold text-slate-900 mt-1">
                {invoices.reduce((acc, current) => acc + current.amount, 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} Fcfa
              </h5>
            </div>
            <FileText className="w-8 h-8 text-blue-500 opacity-60" />
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">CA Encaissé</span>
              <h5 className="text-base font-extrabold text-emerald-700 mt-1">
                {invoices.filter(i => i.status === "PAID").reduce((acc, current) => acc + current.amount, 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} Fcfa
              </h5>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-150 text-amber-800 text-[9px] font-bold">CA En Retard / Attente</span>
              <h5 className="text-base font-extrabold text-amber-700 mt-1">
                {invoices.filter(i => i.status !== "PAID").reduce((acc, current) => acc + current.amount, 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} Fcfa
              </h5>
            </div>
            <DollarSign className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic leading-relaxed">
          <b>Méthodologie :</b> Les factures de type "mensuel" regroupent et calculent automatiquement la somme de l'accompagnement d'un patient donné pour une période calendaire.
        </div>
      </div>

      {/* Creation Invoice modal forms */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">Générer une Facture</h4>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Selector de mode */}
              <div className="grid grid-cols-2 gap-2 border border-slate-100 bg-slate-50 p-1 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setBillingMode("unit")}
                  className={`text-xs font-bold py-1.5 rounded-md ${billingMode === "unit" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500"}`}
                >
                  Course Unitaire
                </button>
                <button 
                  type="button" 
                  onClick={() => setBillingMode("monthly")}
                  className={`text-xs font-bold py-1.5 rounded-md ${billingMode === "monthly" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500"}`}
                >
                  Regroupement Mensuel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sélectionner Client *</label>
                <select 
                  name="clientId"
                  required
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                >
                  <option value="">-- Sélectionnez le Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.lastName.toUpperCase()} {c.firstName}</option>
                  ))}
                </select>
              </div>

              {billingMode === "unit" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Associer Trajet Terminé (Facultatif)</label>
                  <select 
                    name="rideId"
                    value={formData.rideId}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Indépendant --</option>
                    {rides.filter(r => r.status === "COMPLETED").map(r => (
                      <option key={r.id} value={r.id}>{r.rideNumber} ({r.date} - arr: {r.arrivalAddress.split(",")[0]})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Période du mois de facturation *</label>
                  <input 
                    type="month" 
                    name="month"
                    required
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Montant Arbitré (Fcfa TTC) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Statut Initial</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="UNPAID">À Payer (En attente)</option>
                    <option value="PAID">Déjà Encaissée</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-2 px-4 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
                >
                  Émettre Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
