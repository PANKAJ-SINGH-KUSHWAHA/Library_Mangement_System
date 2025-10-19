import { useState, useContext } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { firstName, lastName, email, password };
      const res = await register(payload);
      // registration often requires verification; show message and navigate to login
      alert(res || "Registered — check your email to verify account.");
      nav("/login");
    } catch (err) {
      alert(err.response?.data || err.message || "Registration failed");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={firstName} onChange={e=>setFirst(e.target.value)} placeholder="First name" className="w-full border p-2 rounded" required />
          <input value={lastName} onChange={e=>setLast(e.target.value)} placeholder="Last name" className="w-full border p-2 rounded" required />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-2 rounded" required />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6)" type="password" minLength={6} className="w-full border p-2 rounded" required />
          <button disabled={submitting} className="w-full bg-green-600 text-white p-2 rounded">{submitting ? "Registering..." : "Register"}</button>
        </form>
      </div>
    </div>
  );
}
