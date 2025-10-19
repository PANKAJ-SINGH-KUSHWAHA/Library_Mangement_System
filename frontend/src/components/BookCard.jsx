export default function BookCard({ book }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <p className="text-xs mt-2">Category: {book.category || "N/A"}</p>
      <p className="text-xs mt-1">Available: {book.availableCopies ?? book.totalCopies ?? "N/A"}</p>
    </div>
  );
}
