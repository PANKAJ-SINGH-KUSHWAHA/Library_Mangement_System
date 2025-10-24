import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, CheckCircle, History, Search, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import api from "../api/apiClient";

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

  const loanDays = 7; // Default loan period

  // Notification handler
  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch borrow records
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

  // Mark return
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

  // Toggle sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort records
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

      // Calculate borrowDate dynamically if missing
      if (sortField === "borrowDate") {
        valA = valA || (a.dueDate ? new Date(new Date(a.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
        valB = valB || (b.dueDate ? new Date(new Date(b.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
      }

      if (valA instanceof Date && valB instanceof Date) return sortOrder === "asc" ? valA - valB : valB - valA;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50 p-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in">
            <div
              className={`${
                notification.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
              } border-l-4 p-4 rounded-r-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md backdrop-blur-sm`}
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
                <h3 className="font-semibold text-sm">{notification.type === "success" ? "Success" : "Error"}</h3>
                <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <History className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {bookId ? `Borrow History: ${bookTitle}` : "All Borrow Records"}
              </h1>
              <button
                onClick={() => navigate(bookId ? "/borrow-records" : "/manage-books")}
                className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
              >
                ← {bookId ? "All Records" : "Manage Books"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-6">
            <div className="flex gap-2 flex-wrap">
              {["all", "BORROWED", "RETURNED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    statusFilter === status
                      ? status === "all"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                        : status === "BORROWED"
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-green-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                placeholder="Search by user or book..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "User Email", field: "userEmail" },
                    { label: "Book", field: "bookTitle" },
                    { label: "Borrow Date", field: "borrowDate" },
                    { label: "Due Date", field: "dueDate" },
                    { label: "Return Date", field: "returnDate" },
                    { label: "Status", field: "status" },
                    { label: "Actions" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none"
                      onClick={() => col.field && toggleSort(col.field)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.field && sortField === col.field && (
                          <span>{sortOrder === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={bookId ? 6 : 7} className="px-6 py-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No borrow records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">{record.userEmail}</td>
                      {!bookId && <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.bookTitle}</td>}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.borrowDate
                          ? new Date(record.borrowDate).toLocaleDateString()
                          : record.dueDate
                          ? new Date(new Date(record.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            record.status === "BORROWED" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {record.status === "BORROWED" ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {record.status === "BORROWED" ? (
                          <button
                            onClick={() => markReturn(record.id)}
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Returned
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            Completed on {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
