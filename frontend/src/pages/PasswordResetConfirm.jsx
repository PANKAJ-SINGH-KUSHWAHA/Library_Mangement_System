import { useState } from "react";
import { confirmPasswordReset } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordResetConfirm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false); // loader state
  const nav = useNavigate();

  async function handleConfirm(e) {
    e.preventDefault();
    setLoading(true); // start loader
    try {
      const res = await confirmPasswordReset({ email, otp, newPassword });
      const message = res?.data?.message || "Password updated successfully";
      alert(message);
      nav("/login");
    } catch (err) {
      console.error("Password reset error:", err.response?.data);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Invalid OTP or error";
      alert(msg);
    } finally {
      setLoading(false); // stop loader
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">Confirm Password Reset</h2>
        <form onSubmit={handleConfirm} className="mt-4 space-y-3">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full border p-2 rounded"
            required
            disabled={loading} // disable input while loading
          />
          <input
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="OTP"
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
          <input
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            minLength={6}
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={loading} // disable button while loading
          >
            {loading ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
