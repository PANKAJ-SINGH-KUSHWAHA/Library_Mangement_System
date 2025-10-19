import { useState } from "react";
import { confirmPasswordReset } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordResetConfirm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const nav = useNavigate();

  async function handleConfirm(e) {
    e.preventDefault();
    try {
      const res = await confirmPasswordReset({ email, otp, newPassword });
      alert(res || "Password updated");
      nav("/login");
    } catch (err) {
      alert(err.response?.data || "Invalid OTP or error");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">Confirm Password Reset</h2>
        <form onSubmit={handleConfirm} className="mt-4 space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-2 rounded" required />
          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="OTP" className="w-full border p-2 rounded" required />
          <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" type="password" minLength={6} className="w-full border p-2 rounded" required />
          <button className="w-full bg-green-600 text-white p-2 rounded">Change password</button>
        </form>
      </div>
    </div>
  );
}
