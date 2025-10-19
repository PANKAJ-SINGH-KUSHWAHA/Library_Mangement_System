import { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import BookCard from "../components/BookCard";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    try {
      const data = await getBooks();
      setBooks(data || []);
    } catch (err) {
      alert("Could not fetch books");
    }
  }

  const filtered = books.filter(b => {
    if (q && !b.title.toLowerCase().includes(q.toLowerCase()) && !b.author?.toLowerCase().includes(q.toLowerCase())) return false;
    if (category && b.category?.toLowerCase() !== category.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="mb-4 flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title or author" className="border p-2 rounded flex-1"/>
        <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="border p-2 rounded w-48"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.length ? filtered.map(b => <BookCard key={b.id} book={b} />) : <p>No books found</p>}
      </div>
    </div>
  );
}
