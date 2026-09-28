import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;

    api
      .get("/appointments", { params })
      .then((res) => setAppointments(res.data))
      .catch(() => setError("Could not load appointments."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  async function updateStatus(id, status) {
    try {
      await api.put(`/appointments/${id}`, { status });
      load();
    } catch {
      setError("Could not update appointment.");
    }
  }

  return (
    <div>
      <PageHeader title="Appointments" />

      <div className="flex gap-3 mb-4">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-2 font-medium">Date</th>
              <th className="px-5 py-2 font-medium">Time</th>
              <th className="px-5 py-2 font-medium">Patient</th>
              <th className="px-5 py-2 font-medium">Doctor</th>
              <th className="px-5 py-2 font-medium">Source</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : appointments.length ? (
              appointments.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-5 py-2">{a.appointment_date}</td>
                  <td className="px-5 py-2">{a.appointment_time}</td>
                  <td className="px-5 py-2">{a.patient_name}<br /><span className="text-gray-400 text-xs">{a.phone_number}</span></td>
                  <td className="px-5 py-2">{a.doctor_name}<br /><span className="text-gray-400 text-xs">{a.specialty}</span></td>
                  <td className="px-5 py-2 capitalize">{a.source}</td>
                  <td className="px-5 py-2 capitalize">{a.status}</td>
                  <td className="px-5 py-2 text-right space-x-3">
                    {a.status !== "completed" && (
                      <button onClick={() => updateStatus(a.id, "completed")} className="text-green-600 hover:underline">
                        Mark done
                      </button>
                    )}
                    {a.status !== "cancelled" && (
                      <button onClick={() => updateStatus(a.id, "cancelled")} className="text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400">No appointments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
