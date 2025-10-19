import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { role, firstName } = useAuth();
  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold">Welcome, {firstName || "User"}</h1>
        <p className="mt-2">Role: <span className="font-medium">{role || "GUEST"}</span></p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/books" className="p-4 border rounded hover:shadow">Browse Books</Link>
          {(role === "ADMIN" || role === "LIBRARIAN") && (
            <Link to="/manage-books" className="p-4 border rounded hover:shadow">Manage Books</Link>
          )}
          {role === "ADMIN" && <Link to="/users" className="p-4 border rounded hover:shadow">User Management</Link>}
        </div>
      </div>
    </div>
  );
}
