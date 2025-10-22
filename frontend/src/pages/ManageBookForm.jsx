import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, addBook, updateBook } from "../api/books";

export default function ManageBookForm() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      getBook(id)
        .then((data) =>
          setBook({
            ...data,
            imageUrl: data.imageUrl || "",
          })
        )
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {id ? "Edit Book Details" : "Add New Book"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Book Title
            </label>
            <input
              type="text"
              name="title"
              value={book.title}
              onChange={handleChange}
              placeholder="Enter book title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={book.author}
              onChange={handleChange}
              placeholder="Enter author name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Publisher */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={book.publisher}
              onChange={handleChange}
              placeholder="Enter publisher name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Total Copies */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Total Copies
            </label>
            <input
              type="number"
              name="totalCopies"
              value={book.totalCopies}
              onChange={handleChange}
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Available Copies */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Available Copies
            </label>
            <input
              type="number"
              name="availableCopies"
              value={book.availableCopies}
              onChange={handleChange}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Book Cover Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={book.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {book.imageUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <div className="w-full border rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
                  <img
                    src={book.imageUrl}
                    alt="Book Cover"
                    className="max-h-80 w-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/manage-books")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {id ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
