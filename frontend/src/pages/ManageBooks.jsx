import { useEffect, useState } from "react";
import { getBooks, addBook, updateBook, deleteBook } from "../api/books";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", category: "", totalCopies: 1 });
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchBooks(); }, []);

  async function fetchBooks() {
    try {
      const data = await getBooks();
      setBooks(data || []);
    } catch (err) { alert("Err"); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateBook(editing.id, { ...form, availableCopies: form.totalCopies });
        setEditing(null);
      } else {
        await addBook({ ...form, availableCopies: form.totalCopies });
      }
      setForm({ title: "", author: "", category: "", totalCopies: 1 });
      fetchBooks();
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  }

  function edit(b) {
    setEditing(b);
    setForm({
      title: b.title || "",
      author: b.author || "",
      category: b.category || "",
      totalCopies: b.totalCopies || 1
    });
  }

  async function remove(id) {
    if (!confirm("Delete book?")) return;
    await deleteBook(id);
    fetchBooks();
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">{editing ? "Edit Book" : "Add Book"}</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border p-2 rounded" required/>
            <input value={form.author} onChange={e=>setForm({...form, author:e.target.value})} placeholder="Author" className="w-full border p-2 rounded" />
            <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="Category" className="w-full border p-2 rounded" />
            <input type="number" value={form.totalCopies} onChange={e=>setForm({...form, totalCopies: parseInt(e.target.value||1)})} min={1} className="w-full border p-2 rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? "Update" : "Add"}</button>
            {editing && <button type="button" onClick={()=>{setEditing(null); setForm({title:"",author:"",category:"",totalCopies:1})}} className="ml-2 text-sm text-gray-600">Cancel</button>}
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Books</h3>
          <div className="space-y-2">
            {books.map(b => (
              <div key={b.id} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-gray-600">{b.author} • {b.category}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>edit(b)} className="text-blue-600">Edit</button>
                  <button onClick={()=>remove(b.id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
