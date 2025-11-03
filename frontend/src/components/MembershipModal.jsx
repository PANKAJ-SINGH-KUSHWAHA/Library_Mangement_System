import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function MembershipModal({ open, onClose, user, onAssigned }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    fetchPlans();
    if (user && user.id) fetchUser(user.id);
  }, [open, user]);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get("/memberships/plans");
      setPlans(data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load plans");
    }
  };

  const fetchUser = async (userId) => {
    try {
      const { data } = await api.get(`/memberships/user/${userId}`);
      setCurrentUser(data || null);
    } catch (err) {
      // It's okay if backend doesn't return extra membership fields; fallback to provided user
      setCurrentUser(user || null);
    }
  };

  const assign = async (planId) => {
    if (!user || !user.id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = { userId: user.id, planId };
      const { data } = await api.post("/memberships/assign", payload);
      setCurrentUser(data);
      if (onAssigned) onAssigned();
    } catch (err) {
      setError(err.response?.data || "Failed to assign plan");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Manage Membership</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Member: <span className="font-semibold">{user?.firstName} {user?.lastName} ({user?.email})</span></p>
            <p className="text-sm text-gray-600">Current plan: <span className="font-semibold">{currentUser?.plan?.name || "None"}</span></p>
            <p className="text-sm text-gray-600">Expiry: <span className="font-semibold">{currentUser?.membershipExpiry || "-"}</span></p>
          </div>

          {error && (
            <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{String(error)}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.id} className={`p-4 border rounded-lg flex flex-col justify-between ${currentUser?.plan?.id === p.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                <div>
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-sm text-gray-600">Fee: ₹{p.monthlyFee}</p>
                  <p className="text-sm text-gray-600">Borrow limit: {p.borrowLimit}</p>
                  <p className="text-sm text-gray-600">Max days: {p.maxDurationDays ?? 'N/A'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => assign(p.id)}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${currentUser?.plan?.id === p.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700'}`}>
                    {currentUser?.plan?.id === p.id ? 'Assigned' : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">Close</button>
        </div>
      </div>
    </div>
  );
}
