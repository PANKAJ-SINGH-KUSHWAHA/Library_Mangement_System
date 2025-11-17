import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, Library, RefreshCcw, Sparkles, Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import formatDate from "../utils/formatDate";

export default function MyBorrowedBooks() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [renewingId, setRenewingId] = useState(null);
  const [notif, setNotif] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showNotif = (message, type = "success") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const fetchRecords = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setError(null);
    try {
      const res = await api.get(`/borrow/${user.email}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching borrowed books:", err.response?.data || err.message);
      setError(err.response?.data || "Failed to fetch borrowed books. Please try again.");
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const renewRecord = async (recordId) => {
    setRenewingId(recordId);
    try {
      const res = await api.put(`/borrow/renew/${recordId}`);
      await fetchRecords();
      const newDue = res?.data?.dueDate;
      showNotif(
        newDue
          ? `Renewal successful — new due date: ${formatDate(newDue)}`
          : "Renewal successful — due date updated.",
        "success"
      );
    } catch (err) {
      console.error("Error renewing record:", err.response?.data || err.message);
      const msg = err.response?.data || "Failed to renew. Please try again.";
      showNotif(msg, "error");
    } finally {
      setRenewingId(null);
    }
  };

  // Filter and sort records - latest books at top (by id or borrow date)
  const filteredRecords = records
    .filter((rec) =>
      rec.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.id - a.id); // Sort by ID descending (latest first)

  useEffect(() => {
    if (user?.email) {
      fetchRecords();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center p-12 max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Authentication Required</h2>
          <p className="text-purple-200 text-lg">Please log in to view your borrowed books.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced notification */}
        {notif && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
            <div
              className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
                notif.type === "success" 
                  ? "bg-emerald-500/90 border-emerald-400/50 text-white" 
                  : "bg-rose-500/90 border-rose-400/50 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {notif.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="font-medium">{notif.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-xl">
                  <Library className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700">
                    My Borrowed Books
                  </h1>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium">
                  Track and manage your reading journey
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchRecords(true)}
              disabled={refreshing}
              className="group relative inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl border border-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw className={`w-5 h-5 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 text-purple-300 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search books by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-base font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-purple-700 hover:text-purple-900 transition-colors px-2"
                  >
                    <span className="text-sm font-semibold">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300/30 border-t-purple-400"></div>
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
              </div>
              <p className="text-gray-700 font-medium">Loading your books...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-500/20 backdrop-blur-xl border border-rose-400/30 rounded-3xl p-8 text-center shadow-2xl">
            <div className="bg-gradient-to-br from-rose-400 to-red-500 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-rose-100 text-lg font-medium">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
            <div className="bg-gradient-to-br from-slate-400 to-slate-500 p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Books Borrowed</h3>
            <p className="text-gray-700 text-lg">Start your reading adventure today!</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
            <div className="bg-gradient-to-br from-slate-400 to-slate-500 p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Books Found</h3>
            <p className="text-gray-700 text-lg">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                
                <div className="relative p-6 flex flex-col h-full">
                  {/* Book Title Section */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 leading-tight flex-1">
                        {rec.bookTitle}
                      </h3>
                    </div>
                    
                    {/* Date Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Calendar className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-purple-700 text-xs font-medium block mb-0.5">Due Date</span>
                          <span className="text-gray-800 text-sm font-semibold">
                            {rec.dueDate ? formatDate(rec.dueDate) : 'Not set'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Clock className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-purple-700 text-xs font-medium block mb-0.5">Return Date</span>
                          <span className="text-gray-800 text-sm font-semibold">
                            {rec.returnDate ? formatDate(rec.returnDate) : 'Not returned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Action Section */}
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      {rec.status === "BORROWED" ? (
                        <>
                          <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg">
                            <AlertCircle className="w-4 h-4" />
                            Borrowed
                          </span>

                          <button
                            onClick={() => renewRecord(rec.id)}
                            disabled={renewingId === rec.id}
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <RefreshCcw className={`w-4 h-4 ${renewingId === rec.id ? "animate-spin" : ""}`} />
                            {renewingId === rec.id ? "Renewing..." : "Renew"}
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg w-full">
                          <CheckCircle className="w-4 h-4" />
                          Returned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
