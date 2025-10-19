import { useState } from "react";
import { requestPasswordReset } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const nav = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    try {
      const res = await requestPasswordReset(email);
      alert(res || "OTP sent to your email");
      nav("/password-reset/confirm");
    } catch (err) {
      alert(err.response?.data || "Error sending OTP");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">Request Password Reset</h2>
        <form onSubmit={handleRequest} className="mt-4">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" className="w-full border p-2 rounded" required />
          <button className="mt-3 w-full bg-blue-600 text-white p-2 rounded">Send OTP</button>
        </form>
      </div>
    </div>
  );
}
