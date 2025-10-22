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
  });

  useEffect(() => {
    if (id) {
      getBook(id).then(setBook).catch(err => console.error(err));
    }
  }, [id]);

  const handleChange = (e) =>
    setBook({ ...book, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateBook(id, book);
        alert("Book updated successfully");
      } else {
        await addBook(book);
        alert("Book added successfully");
      }
      navigate("/manage-books");
    } catch (err) {
      alert(err.response?.data || "Error saving book");
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-2xl mb-4">{id ? "Edit Book" : "Add Book"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          name="title"
          value={book.title}
          onChange={handleChange}
          placeholder="Title"
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          name="author"
          value={book.author}
          onChange={handleChange}
          placeholder="Author"
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          name="publisher"
          value={book.publisher}
          onChange={handleChange}
          placeholder="Publisher"
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          name="totalCopies"
          value={book.totalCopies}
          onChange={handleChange}
          min={1}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          {id ? "Update Book" : "Add Book"}
        </button>
      </form>
    </div>
  );
}
