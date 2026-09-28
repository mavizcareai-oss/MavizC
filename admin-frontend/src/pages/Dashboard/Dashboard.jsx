import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Bookings (last 7 days)" value={data?.bookings_last_7_days ?? "—"} />
        <StatCard label="Active Doctors" value={data?.active_doctors ?? "—"} />
        <StatCard label="Today's Appointments" value={data?.todays_appointments?.length ?? "—"} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Today's Appointments</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-2 font-medium">Time</th>
              <th className="px-5 py-2 font-medium">Patient</th>
              <th className="px-5 py-2 font-medium">Doctor</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.todays_appointments?.length ? (
              data.todays_appointments.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-5 py-2">{a.appointment_time}</td>
                  <td className="px-5 py-2">{a.patient_name}</td>
                  <td className="px-5 py-2">{a.doctor_name}</td>
                  <td className="px-5 py-2 capitalize">{a.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-gray-400">
                  No appointments today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-brand-700 mt-1">{value}</p>
    </div>
  );
}
