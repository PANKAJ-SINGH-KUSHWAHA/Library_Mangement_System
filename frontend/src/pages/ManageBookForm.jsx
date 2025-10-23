import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, addBook, updateBook } from "../api/books";
import { BookOpen, Save, X, Image, User, Building, Package, CheckCircle } from "lucide-react";

export default function ManageBookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [book, setBook] = useState({
    title: "",
    author: "",
    publisher: "",
    totalCopies: 1,
    availableCopies: 0,
    imageUrl: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getBook(id)
        .then((data) =>
          setBook({
            ...data,
            imageUrl: data.imageUrl || "",
          })
        )
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
    
    // Reset image error when URL changes
    if (name === "imageUrl") {
      setImageError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateBook(id, book);
        alert("Book updated successfully!");
      } else {
        await addBook(book);
        alert("Book added successfully!");
      }
      navigate("/manage-books");
    } catch (err) {
      alert(err.response?.data || "Error saving book");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/manage-books")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Library</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {id ? "Edit Book Details" : "Add New Book"}
              </h1>
              <p className="text-gray-600 mt-1">
                {id ? "Update the information for this book" : "Fill in the details to add a new book to your library"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={book.title}
                    onChange={handleChange}
                    placeholder="Enter the book title"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={book.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Publisher */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    Publisher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={book.publisher}
                    onChange={handleChange}
                    placeholder="Enter publisher name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Copies Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Copies */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      Total Copies <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalCopies"
                      value={book.totalCopies}
                      onChange={handleChange}
                      min={1}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Available Copies */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      Available Copies <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="availableCopies"
                      value={book.availableCopies}
                      onChange={handleChange}
                      min={0}
                      max={book.totalCopies}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cannot exceed total copies ({book.totalCopies})
                    </p>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Image className="w-4 h-4 text-gray-500" />
                    Book Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={book.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/book-cover.jpg"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Enter a URL for the book cover image
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => navigate("/manage-books")}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {id ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {id ? "Update Book" : "Add Book"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-gray-600" />
                Preview
              </h2>
              
              {/* Book Cover Preview */}
              <div className="mb-4">
                <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  {book.imageUrl && !imageError ? (
                    <img
                      src={book.imageUrl}
                      alt="Book Cover Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="text-center p-6">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        {book.imageUrl && imageError
                          ? "Failed to load image"
                          : "No cover image"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Details Preview */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Title</p>
                  <p className="font-semibold text-gray-800 truncate">
                    {book.title || "Book Title"}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Author</p>
                  <p className="text-sm text-gray-700 truncate">
                    {book.author || "Author Name"}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Publisher</p>
                  <p className="text-sm text-gray-700 truncate">
                    {book.publisher || "Publisher Name"}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Availability</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        book.availableCopies === 0
                          ? "bg-red-500"
                          : book.availableCopies < book.totalCopies / 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}