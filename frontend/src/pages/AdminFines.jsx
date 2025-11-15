import { useEffect, useState } from "react";
import { CheckCircle, DollarSign, Clock, User, BookOpen, Search, RefreshCw } from "lucide-react";
import api from "../api/apiClient";
import formatDate from "../utils/formatDate";

export default function AdminFines() {
  const [tab, setTab] = useState("unpaid"); // 'unpaid' | 'history'
  const [unpaid, setUnpaid] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // for history: all/paid/unpaid
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchUnpaid();
    // optionally prefetch history only when user switches
  }, []);

  const showNotification = (message, type = "success") => {
    setNotif({ message, type, id: Date.now() });
    setTimeout(() => setNotif(null), 4000);
  };

  async function fetchUnpaid() {
    setLoading(true);
    try {
      const { data } = await api.get("/borrow/admin/unpaid-fines");
      setUnpaid(data || []);
    } catch (err) {
      console.error("Error fetching unpaid fines:", err);
      showNotification("Failed to load unpaid fines", "error");
      setUnpaid([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    setLoading(true);
    try {
      // NOTE: backend endpoint for all fines may not exist yet — see backend snippet below.
      const { data } = await api.get("/borrow/admin/fines");
      setHistory(data || []);
    } catch (err) {
      console.error("Error fetching fine history:", err);
      showNotification("Failed to load fine history", "error");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  const markPaid = async (fineId) => {
    try {
      await api.put(`/borrow/fines/${fineId}/pay`);
      showNotification("Marked fine as paid", "success");
      // refresh both lists
      fetchUnpaid();
      if (tab === "history") fetchHistory();
    } catch (err) {
      console.error("Error paying fine:", err);
      showNotification(err.response?.data || "Failed to mark fine paid", "error");
    }
  };

  // UI helpers
  const filteredHistory = history.filter((h) => {
    if (statusFilter === "paid") return h.paid === true;
    if (statusFilter === "unpaid") return h.paid === false;
    return true;
  }).filter(h => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (h.userName || "").toLowerCase().includes(q)
        || (h.userEmail || "").toLowerCase().includes(q)
        || (h.bookTitle || "").toLowerCase().includes(q)
        || String(h.amount || "").toLowerCase().includes(q)
        || String(h.fineId || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Notification */}
      {notif && (
        <div className={`mb-4 p-3 rounded-lg ${notif.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <strong className="block">{notif.type === "success" ? "Success" : "Error"}</strong>
          <div className="text-sm">{notif.message}</div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin • Fines & Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (tab === "unpaid") fetchUnpaid();
              else fetchHistory();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-50 border"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setTab("unpaid"); fetchUnpaid(); }}
          className={`px-4 py-2 rounded ${tab === "unpaid" ? "bg-orange-500 text-white" : "bg-white border"}`}
        >
          Unpaid Fines ({unpaid.length})
        </button>
        <button
          onClick={() => { setTab("history"); fetchHistory(); }}
          className={`px-4 py-2 rounded ${tab === "history" ? "bg-orange-500 text-white" : "bg-white border"}`}
        >
          Transaction History
        </button>
      </div>

      {/* Unpaid tab */}
      {tab === "unpaid" && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          {loading ? <p>Loading...</p> : (
            <>
              {unpaid.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold">No unpaid fines</p>
                  <p className="text-sm text-gray-500">All fines are cleared.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="px-3 py-3">Member</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Book</th>
                        <th className="px-3 py-3">Amount (₹)</th>
                        <th className="px-3 py-3">Due Date</th>
                        <th className="px-3 py-3">Created</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unpaid.map((f) => (
                        <tr key={f.fineId} className="border-b hover:bg-orange-50">
                          <td className="px-3 py-3">{f.userName || "—"}</td>
                          <td className="px-3 py-3">{f.userEmail || "—"}</td>
                          <td className="px-3 py-3">{f.bookTitle || "—"}</td>
                          <td className="px-3 py-3">₹{Number(f.amount).toFixed(2)}</td>
                          <td className="px-3 py-3">{f.dueDate ? formatDate(f.dueDate) : "-"}</td>
                          <td className="px-3 py-3">{f.createdAt ? formatDate(f.createdAt) : "-"}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => markPaid(f.fineId)}
                                className="px-3 py-1 bg-green-600 text-white rounded inline-flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> Mark Paid
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by member, email, book, amount..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <select className="border rounded px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {loading ? <p>Loading...</p> : (
            <>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold">No transactions found</p>
                  <p className="text-sm text-gray-500">Try changing filters or search terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                      <tr>
                        <th className="px-3 py-3">ID</th>
                        <th className="px-3 py-3">Member</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Book</th>
                        <th className="px-3 py-3">Amount (₹)</th>
                        <th className="px-3 py-3">Paid</th>
                        <th className="px-3 py-3">Paid At</th>
                        <th className="px-3 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(h => (
                        <tr key={h.fineId} className="border-b hover:bg-slate-50">
                          <td className="px-3 py-3">{h.fineId}</td>
                          <td className="px-3 py-3">{h.userName || "-"}</td>
                          <td className="px-3 py-3">{h.userEmail || "-"}</td>
                          <td className="px-3 py-3">{h.bookTitle || "-"}</td>
                          <td className="px-3 py-3">₹{Number(h.amount).toFixed(2)}</td>
                          <td className="px-3 py-3">
                            {h.paid ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-red-600 font-semibold">Unpaid</span>}
                          </td>
                          <td className="px-3 py-3">{h.paidAt ? formatDate(h.paidAt) : "-"}</td>
                          <td className="px-3 py-3">{h.createdAt ? formatDate(h.createdAt) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
