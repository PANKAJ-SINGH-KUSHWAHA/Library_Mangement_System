// src/pages/AdminFines.jsx
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Clock,
  Users,
  Info,
  List
} from "lucide-react";
import api from "../api/apiClient";
import formatDate from "../utils/formatDate";

const PAGE_SIZE = 10;

export default function AdminFines() {
  const [tab, setTab] = useState("unpaid"); // 'unpaid' | 'history'
  const [unpaid, setUnpaid] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // for history: all/paid/unpaid
  const [notif, setNotif] = useState(null);

  // pagination + sort
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: "createdAt", dir: "desc" });

  // payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paidByInput, setPaidByInput] = useState("");

  useEffect(() => {
    fetchUnpaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // reset page when tab/search/filter changes
    setPage(1);
  }, [tab, query, statusFilter, sortBy]);

  const showNotification = (message, type = "success") => {
    setNotif({ message, type, id: Date.now() });
    setTimeout(() => setNotif(null), 4000);
  };

  async function fetchUnpaid() {
    setLoading(true);
    try {
      const { data } = await api.get("/borrow/admin/unpaid-fines");
      setUnpaid(Array.isArray(data) ? data : []);
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
      const { data } = await api.get("/borrow/admin/fines");
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching fine history:", err);
      showNotification("Failed to load fine history", "error");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  const refreshCurrent = () => {
    if (tab === "unpaid") fetchUnpaid();
    else fetchHistory();
  };

  const openPayModal = (fine) => {
    setSelectedFine(fine);
    setPaidByInput("");
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setSelectedFine(null);
    setPaidByInput("");
    setPayModalOpen(false);
  };

  const markPaid = async (fineId, paidBy) => {
    try {
      await api.put(`/borrow/fines/${fineId}/pay`, null, { params: paidBy ? { paidBy } : {} });
      showNotification("Marked fine as paid", "success");
      closePayModal();
      refreshCurrent();
    } catch (err) {
      console.error("Error paying fine:", err);
      showNotification(err?.response?.data || "Failed to mark fine paid", "error");
    }
  };

  // Derived datasets (search, filter, sort, paginate)
  const activeList = useMemo(() => (tab === "unpaid" ? unpaid : history), [tab, unpaid, history]);

  const searched = useMemo(() => {
    if (!query) return activeList;
    const q = query.trim().toLowerCase();
    return activeList.filter((h) => {
      return (
        (h.userName || "").toLowerCase().includes(q) ||
        (h.userEmail || "").toLowerCase().includes(q) ||
        (h.bookTitle || "").toLowerCase().includes(q) ||
        String(h.amount || "").toLowerCase().includes(q) ||
        String(h.fineId || "").toLowerCase().includes(q)
      );
    });
  }, [activeList, query]);

  const filtered = useMemo(() => {
    if (tab === "history") {
      if (statusFilter === "paid") return searched.filter((s) => s.paid === true);
      if (statusFilter === "unpaid") return searched.filter((s) => s.paid === false);
    }
    return searched;
  }, [searched, statusFilter, tab]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { field, dir } = sortBy;
    arr.sort((a, b) => {
      const A = a[field];
      const B = b[field];
      if (A == null && B == null) return 0;
      if (A == null) return dir === "asc" ? -1 : 1;
      if (B == null) return dir === "asc" ? 1 : -1;

      // dates
      if (field.toLowerCase().includes("date") || field.toLowerCase().includes("at")) {
        const tA = new Date(A).getTime();
        const tB = new Date(B).getTime();
        return dir === "asc" ? tA - tB : tB - tA;
      }
      // numbers
      if (typeof A === "number" || !isNaN(Number(A))) {
        return dir === "asc" ? Number(A) - Number(B) : Number(B) - Number(A);
      }
      // strings
      return dir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });
    return arr;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSlice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const totalOutstanding = unpaid.reduce((acc, f) => acc + Number(f.amount || 0), 0);
    return {
      totalUnpaid: unpaid.length,
      totalTransactions: history.length,
      totalOutstanding,
    };
  }, [unpaid, history]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notif && (
        <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${notif.type === "success" ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
          <div className={`p-2 rounded-full ${notif.type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">{notif.type === "success" ? "Success" : "Error"}</div>
            <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-200" />
              Fines & Transactions
            </h1>
            <p className="text-sm opacity-90 mt-1">View unpaid fines, mark payments, and review transaction history for members.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3 py-2 rounded-lg flex items-center gap-3">
              <Users className="w-5 h-5" />
              <div className="text-sm">
                <div className="text-xs opacity-80">Outstanding</div>
                <div className="font-semibold">₹{summary.totalOutstanding.toFixed(2)}</div>
              </div>
            </div>

            <button
              onClick={refreshCurrent}
              className="inline-flex items-center bg-white/10 gap-2 bg-opacity-10 hover:bg-opacity-20 px-3 py-2 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs + Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => { setTab("unpaid"); fetchUnpaid(); }}
            className={`px-4 py-2 rounded-full font-semibold ${tab === "unpaid" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" : "bg-white border"}`}
          >
            Unpaid ({unpaid.length})
          </button>
          <button
            onClick={() => { setTab("history"); fetchHistory(); }}
            className={`px-4 py-2 rounded-full font-semibold ${tab === "history" ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg" : "bg-white border"}`}
          >
            Transactions
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-3 md:justify-end items-stretch md:items-center">
          <div className="flex items-center bg-white rounded-lg border overflow-hidden w-full md:w-96">
            <input
              className="px-4 py-2 w-full outline-none"
              placeholder="Search member, email, book, amount..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="px-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {tab === "history" && (
            <select
              className="px-3 py-2 rounded-lg border"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          )}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border">
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Unpaid fines</div>
            <div className="text-xl font-bold">{summary.totalUnpaid}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border">
          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Outstanding amount</div>
            <div className="text-xl font-bold">₹{summary.totalOutstanding.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border">
          <div className="p-3 rounded-lg bg-gradient-to-br from-sky-100 to-sky-200">
            <List className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Total transactions</div>
            <div className="text-xl font-bold">{history.length}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => setSortBy({ field: "amount", dir: sortBy.dir === "asc" ? "desc" : "asc" })}>
                  Amount {sortBy.field === "amount" ? (sortBy.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : pageSlice.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="bg-gradient-to-br from-gray-100 to-white rounded-xl p-6 shadow-inner text-center">
                        <AlertCircle className="mx-auto w-12 h-12 text-yellow-500" />
                        <h3 className="text-lg font-semibold mt-3">No records found</h3>
                        <p className="text-sm text-gray-500 mt-2">Try changing filters, searching a different term, or refresh the list.</p>
                        <div className="mt-4">
                          <button onClick={refreshCurrent} className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow">Refresh</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageSlice.map((f, idx) => {
                  const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                  return (
                    <tr key={f.fineId} className={`${zebra} hover:bg-orange-50 transition`}>
                      <td className="px-4 py-4 align-top font-mono text-xs text-gray-600">{f.fineId}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-white flex items-center justify-center font-semibold">
                            {f.userName ? f.userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold">{f.userName || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-gray-700">{f.userEmail || "—"}</td>
                      <td className="px-4 py-4 align-top max-w-xs truncate">{f.bookTitle || "—"}</td>
                      <td className="px-4 py-4 align-top font-semibold text-gray-900">₹{Number(f.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 align-top text-sm text-gray-600">{f.dueDate ? formatDate(f.dueDate) : "-"}</td>
                      <td className="px-4 py-4 align-top text-sm text-gray-600">{f.createdAt ? formatDate(f.createdAt) : "-"}</td>
                      <td className="px-4 py-4 align-top">
                        {f.paid ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-4 h-4" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                            <Clock className="w-4 h-4" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        {!f.paid ? (
                          <div className="flex gap-2">
                            <button onClick={() => openPayModal(f)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white inline-flex items-center gap-2 shadow hover:scale-105 transition">
                              <CheckCircle className="w-4 h-4" /> Mark Paid
                            </button>
                            <button onClick={() => navigator.clipboard?.writeText(`Fine:${f.fineId} User:${f.userEmail} ₹${Number(f.amount).toFixed(2)}`)} title="Copy" className="px-3 py-1 rounded-lg bg-white border text-gray-700">
                              Copy
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            <div>{f.paidBy ? <span className="block"><strong>By:</strong> {f.paidBy}</span> : null}</div>
                            <div className="mt-1">{f.paidAt ? formatDate(f.paidAt) : ""}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
          <div className="text-sm text-gray-600">
            Showing <strong>{sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</strong> - <strong>{Math.min(sorted.length, page * PAGE_SIZE)}</strong> of <strong>{sorted.length}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg bg-white border hover:shadow" disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-sm">{page} / {totalPages}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-lg bg-white border hover:shadow" disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pay modal */}
      {payModalOpen && selectedFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePayModal}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Confirm payment</h3>
                <p className="text-sm text-gray-500 mt-1">Fine ID: <span className="font-mono">{selectedFine.fineId}</span> — Amount: <strong>₹{Number(selectedFine.amount).toFixed(2)}</strong></p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Member</label>
                <div className="mt-1 font-semibold">{selectedFine.userName || selectedFine.userEmail || "-"}</div>
                <div className="text-xs text-gray-400 mt-1">{selectedFine.bookTitle || ""}</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Paid by (method / note)</label>
                <input
                  value={paidByInput}
                  onChange={(e) => setPaidByInput(e.target.value)}
                  placeholder="e.g. Cash — Counter | UPI Txn id"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closePayModal} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button onClick={() => markPaid(selectedFine.fineId, paidByInput)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow">
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
