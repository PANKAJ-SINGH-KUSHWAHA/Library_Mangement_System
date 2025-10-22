import { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import { 
  BookOpen, 
  User, 
  Building2, 
  Package, 
  Search,
  Filter,
  BookMarked,
  CheckCircle,
  AlertCircle,
  Loader,
  X
} from "lucide-react";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [borrowing, setBorrowing] = useState(null);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      showNotification("Failed to load books", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBorrow = async (bookId, bookTitle) => {
    if (user?.role !== "MEMBER") {
      showNotification("Only users can borrow books", "error");
      return;
    }
    setBorrowing(bookId);
    try {
      await api.post(`/borrow/${bookId}?email=${user.email}`);
      showNotification(`"${bookTitle}" borrowed successfully!`, "success");
      fetchBooks();
    } catch (err) {
      showNotification(err.response?.data || "Error borrowing book", "error");
    } finally {
      setBorrowing(null);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    let filtered = books;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Available only filter
    if (filterAvailable) {
      filtered = filtered.filter(book => book.availableCopies > 0);
    }

    setFilteredBooks(filtered);
  }, [searchTerm, filterAvailable, books]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            Book Catalog
          </h1>
          <p className="text-gray-600">Explore our collection of amazing books</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg animate-slide-in ${
            notification.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, or publisher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterAvailable(!filterAvailable)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                filterAvailable
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-5 h-5" />
              Available Only
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredBooks.length}</span> of {books.length} books
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 transform group"
              >
                {/* Book Cover Placeholder */}
                <div className="h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="w-20 h-20 text-white opacity-50" />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  
                  {/* Availability Badge */}
                  {book.availableCopies > 0 ? (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Available
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {book.title}
                  </h2>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{book.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{book.publisher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {book.availableCopies} {book.availableCopies === 1 ? 'copy' : 'copies'} available
                      </span>
                    </div>
                  </div>

                  {/* Borrow Button */}
                  {user?.role?.toUpperCase() === "MEMBER" && book.availableCopies > 0 && (
                    <button
                      onClick={() => handleBorrow(book.id, book.title)}
                      disabled={borrowing === book.id}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {borrowing === book.id ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Borrowing...
                        </>
                      ) : (
                        <>
                          <BookMarked className="w-5 h-5" />
                          Borrow Book
                        </>
                      )}
                    </button>
                  )}

                  {user?.role?.toUpperCase() === "MEMBER" && book.availableCopies === 0 && (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}