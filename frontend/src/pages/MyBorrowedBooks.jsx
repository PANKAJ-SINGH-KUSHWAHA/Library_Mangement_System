import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, Library, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export default function MyBorrowedBooks() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    if (user?.email) {
      fetchRecords();
    }
  }, [user]); // re-run when user becomes available

  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your borrowed books.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Borrowed Books</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track your borrowed items
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchRecords(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 shadow-sm hover:shadow border border-gray-200 transition-all hover:bg-gray-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Books Borrowed</h3>
            <p className="text-gray-600">You haven't borrowed any books yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.bookTitle}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Due: {rec.dueDate ? new Date(rec.dueDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Status:</span>
                      </div>
                      {rec.status === "BORROWED" ? (
                        <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Borrowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
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
