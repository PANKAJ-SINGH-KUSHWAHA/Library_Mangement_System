import { AlertCircle, ArrowLeft, BookOpen, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, History, Search, User, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import formatDate from "../utils/formatDate";

export default function BorrowRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("borrowDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [notification, setNotification] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const bookId = searchParams.get("bookId");

  const loanDays = 7;

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let endpoint = "/borrow/all";
      if (bookId) {
        endpoint = `/borrow/book/${bookId}`;
        const bookResponse = await api.get(`/books/${bookId}`);
        setBookTitle(bookResponse.data.title);
      }
      const { data } = await api.get(endpoint);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
      showNotification("Failed to fetch borrow records", "error");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [bookId]);

  const markReturn = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      showNotification("Book marked as returned!", "success");
      fetchRecords();
    } catch (err) {
      console.error("Error marking book returned:", err);
      showNotification(err.response?.data || "Error marking book as returned", "error");
    }
  };

  // ----- Renew function -----
  const renewRecord = async (recordId, userEmail) => {
    try {
      // axios put with no body, only query params: put(url, data, config)
      await api.put(`/borrow/renew/${recordId}`, null, { params: userEmail ? { email: userEmail } : {} });
      showNotification("Book renewed successfully!", "success");
      fetchRecords();
    } catch (err) {
      console.error("Error renewing book:", err);
      // backend should return helpful messages like "You have a free plan — renewals are not allowed."
      showNotification(err.response?.data || "Failed to renew book", "error");
    }
  };
  // ---------------------------

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredRecords = records
    .filter((record) => {
      const matchesStatus = statusFilter === "all" || record.status === statusFilter.toUpperCase();
      const matchesSearch =
        record.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (!bookId && record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "borrowDate") {
        valA = valA || (a.dueDate ? new Date(new Date(a.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
        valB = valB || (b.dueDate ? new Date(new Date(b.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
      }

      if (valA instanceof Date && valB instanceof Date) return sortOrder === "asc" ? valA - valB : valB - valA;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const stats = {
    total: records.length,
    borrowed: records.filter(r => r.status === "BORROWED").length,
    returned: records.filter(r => r.status === "RETURNED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 absolute top-0 left-0"></div>
          <BookOpen className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === "success"
                ? "bg-white border-green-500"
                : "bg-white border-red-500"
            } border-l-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-xl`}
          >
            <div
              className={`p-2 rounded-full ${notification.type === "success" ? "bg-green-100" : "bg-red-100"}`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${notification.type === "success" ? "text-green-900" : "text-red-900"}`}>
                {notification.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(bookId ? "/borrow-records" : "/manage-books")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{bookId ? "All Records" : "Manage Books"}</span>
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
              <History className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {bookId ? `Borrow History` : "All Borrow Records"}
              </h1>
              {bookId && (
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {bookTitle}
                </p>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Currently Borrowed</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.borrowed}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Returned</p>
                  <p className="text-3xl font-bold text-green-600">{stats.returned}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                {["all", "BORROWED", "RETURNED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                      statusFilter === status
                        ? status === "all"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                          : status === "BORROWED"
                          ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200"
                          : "bg-green-500 text-white shadow-lg shadow-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user email or book title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {[
                    { label: "User Email", field: "userEmail", icon: User },
                    { label: "Book", field: "bookTitle", icon: BookOpen },
                    { label: "Borrow Date", field: "borrowDate", icon: Calendar },
                    { label: "Due Date", field: "dueDate", icon: Clock },
                    { label: "Return Date", field: "returnDate", icon: CheckCircle },
                    { label: "Fine", field: "overdueFine", icon: AlertCircle },
                    { label: "Status", field: "status" },
                    { label: "Actions" },
                  ].map((col) => (
                    <th key={col.label} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {col.icon && <col.icon className="w-4 h-4 text-gray-500" />}
                        {col.label}
                        {col.field && (
                          <button onClick={() => toggleSort(col.field)} className="flex flex-col ml-1 hover:bg-gray-200 rounded p-0.5 transition-colors">
                            <ChevronUp className={`w-3 h-3 ${sortField === col.field && sortOrder === "asc" ? "text-orange-600" : "text-gray-400"}`} />
                            <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === col.field && sortOrder === "desc" ? "text-orange-600" : "text-gray-400"}`} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No records found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-orange-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {record.userEmail.charAt(0).toUpperCase()}
                          </div>
                          {record.userEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.bookTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                          {record.borrowDate
                            ? formatDate(record.borrowDate)
                            : record.dueDate
                            ? formatDate(new Date(new Date(record.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000))
                            : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.dueDate ? formatDate(record.dueDate) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.returnDate ? formatDate(record.returnDate) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.overdueFine ? (
                          <span className="font-semibold text-red-600">₹{Number(record.overdueFine).toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">NO FINE</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            record.status === "BORROWED"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {record.status === "BORROWED" ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {record.status === "BORROWED" ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              {/* Renew button */}
                              <button
                                onClick={() => renewRecord(record.id, record.userEmail)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:scale-105"
                              >
                                <ArrowLeft className="w-4 h-4" /> Renew
                              </button>

                              {/* Mark Returned */}
                              <button
                                onClick={() => markReturn(record.id)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:scale-105"
                              >
                                <CheckCircle className="w-4 h-4" /> Mark Returned
                              </button>
                            </div>

                            {/* Renew metadata (if available from API) */}
                            <div className="text-xs text-gray-500">
                              {typeof record.renewCount !== "undefined" && (
                                <span className="mr-2">Renewals used: <strong>{record.renewCount}</strong></span>
                              )}
                              {typeof record.maxRenewals !== "undefined" && (
                                <span>Allowed: <strong>{record.maxRenewals}</strong></span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            <p className="font-medium text-gray-700">Completed</p>
                            <p>{formatDate(record.returnDate)}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        {filteredRecords.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing <span className="font-semibold text-gray-900">{filteredRecords.length}</span> of <span className="font-semibold text-gray-900">{records.length}</span> records
          </div>
        )}
      </div>
    </div>
  );
}
