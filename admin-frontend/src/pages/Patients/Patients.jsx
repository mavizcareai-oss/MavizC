import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  function load(q) {
    setLoading(true);
    api
      .get("/patients", { params: q ? { search: q } : {} })
      .then((res) => setPatients(res.data))
      .catch(() => setError("Could not load patients."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function openDetail(id) {
    try {
      const res = await api.get(`/patients/${id}`);
      setSelected(res.data);
    } catch {
      setError("Could not load patient details.");
    }
  }

  return (
    <div>
      <PageHeader title="Patients" />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone number..."
        className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Phone</th>
              <th className="px-5 py-2 font-medium">Language</th>
              <th className="px-5 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : patients.length ? (
              patients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-5 py-2">{p.name}</td>
                  <td className="px-5 py-2">{p.phone_number}</td>
                  <td className="px-5 py-2 capitalize">{p.preferred_language}</td>
                  <td className="px-5 py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No patients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} title={selected?.name} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <p className="text-sm text-gray-500 mb-1">{selected.phone_number}</p>
            <p className="text-sm text-gray-500 mb-4 capitalize">Prefers: {selected.preferred_language}</p>
            <h4 className="text-sm font-semibold mb-2">Appointment History</h4>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {selected.appointments?.length ? (
                selected.appointments.map((a) => (
                  <li key={a.id} className="text-sm border border-gray-100 rounded-md px-3 py-2">
                    <span className="font-medium">{a.doctor_name}</span> ({a.specialty}) —{" "}
                    {a.appointment_date} at {a.appointment_time} —{" "}
                    <span className="capitalize">{a.status}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">No appointments yet</li>
              )}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
