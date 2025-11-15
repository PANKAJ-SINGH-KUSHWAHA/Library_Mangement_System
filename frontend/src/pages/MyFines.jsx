import { useEffect, useState } from "react";
import { CheckCircle, CreditCard, Search, XCircle, AlertCircle, Loader2 } from "lucide-react";

import api from "../api/apiClient";
import formatDate from "../utils/formatDate";

export default function MyFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("unpaid");
  const [q, setQ] = useState("");
  const [payingIds, setPayingIds] = useState([]);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotif({ message, type, id: Date.now() });
    setTimeout(() => setNotif(null), 4000);
  };

  async function fetchFines() {
    setLoading(true);
    try {
      const { data } = await api.get("/fines/my");
      setFines(data || []);
    } catch (err) {
      console.error("Error fetching user fines:", err);
      showNotification("Failed to fetch fines", "error");
      setFines([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = fines.filter(f => {
    if (tab === "unpaid" && f.paid) return false;
    if (tab === "history" && q) {
      const s = q.toLowerCase();
      return (f.bookTitle || "").toLowerCase().includes(s) || (String(f.amount) || "").toLowerCase().includes(s);
    }
    return true;
  }).filter(f => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (f.bookTitle || "").toLowerCase().includes(s) || (String(f.amount) || "").toLowerCase().includes(s);
  });

  const payFine = async (fineId) => {
    setPayingIds(prev => [...prev, fineId]);
    try {
      await api.put(`/fines/${fineId}/pay-by-user`);
      showNotification("Fine marked paid — thank you!", "success");
      await fetchFines();
    } catch (err) {
      console.error("Error paying fine:", err);
      showNotification(err.response?.data || "Failed to pay fine", "error");
    } finally {
      setPayingIds(prev => prev.filter(id => id !== fineId));
    }
  };

  const unpaidTotal = fines.filter(f => !f.paid).reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const unpaidCount = fines.filter(f => !f.paid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Notification */}
        {notif && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg border animate-in slide-in-from-top ${
            notif.type === "success" 
              ? "bg-white border-green-400 border-l-4" 
              : "bg-white border-red-400 border-l-4"
          }`}>
            <div className="flex items-start gap-3">
              {notif.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <strong className={`block font-semibold ${notif.type === "success" ? "text-green-900" : "text-red-900"}`}>
                  {notif.type === "success" ? "Success" : "Error"}
                </strong>
                <div className="text-sm text-gray-700 mt-0.5">{notif.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            My Fines
          </h1>
          <p className="text-gray-600">View and manage your library fines</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { setTab("unpaid"); }}
            className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "unpaid"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300"
            }`}
          >
            Unpaid
            {unpaidCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === "unpaid" ? "bg-white/30 text-white" : "bg-red-100 text-red-700"
              }`}>
                {unpaidCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTab("history"); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "history"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300"
            }`}
          >
            History
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-orange-100 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by book title or amount..."
              className="w-full outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
              <p className="text-gray-600">Loading your fines...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">
                {tab === "unpaid" ? "No unpaid fines" : "No transactions found"}
              </p>
              <p className="text-gray-600">You're all clear 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-orange-50">
                  <tr className="text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <th className="px-6 py-4">Book</th>
                    <th className="px-6 py-4">Amount (₹)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(f => {
                    const isPaying = payingIds.includes(f.fineId);
                    return (
                      <tr key={f.fineId} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{f.bookTitle || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            f.paid ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                          }`}>
                            ₹{Number(f.amount || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {f.paid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                              <CheckCircle className="w-4 h-4" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                              <XCircle className="w-4 h-4" />
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{f.createdAt ? formatDate(f.createdAt) : "-"}</td>
                        <td className="px-6 py-4">
                          {!f.paid ? (
                            <button
                              onClick={() => payFine(f.fineId)}
                              disabled={isPaying}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                                isPaying 
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                  : "bg-green-600 hover:bg-green-700 text-white hover:shadow-md"
                              }`}
                            >
                              {isPaying ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4" />
                                  Pay Now
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-medium">Paid on {f.paidAt ? formatDate(f.paidAt) : "-"}</span>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}