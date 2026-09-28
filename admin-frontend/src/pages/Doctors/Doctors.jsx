import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";

const emptyForm = { name: "", specialty: "" };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Login-creation state
  const [loginModalDoctor, setLoginModalDoctor] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginResult, setLoginResult] = useState(null);
  const [loginError, setLoginError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => setError("Could not load doctors."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(doc) {
    setEditingId(doc.id);
    setForm({ name: doc.name, specialty: doc.specialty });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
      } else {
        await api.post("/doctors", { ...form, available_slots: [] });
      }
      setModalOpen(false);
      load();
    } catch {
      setError("Could not save doctor.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this doctor?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      load();
    } catch {
      setError("Could not delete doctor.");
    }
  }

  function openLoginModal(doc) {
    setLoginModalDoctor(doc);
    setLoginEmail("");
    setLoginResult(null);
    setLoginError("");
  }

  async function handleCreateLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.post(`/doctors/${loginModalDoctor.id}/login`, { email: loginEmail });
      setLoginResult(res.data);
    } catch (err) {
      setLoginError(err.response?.data?.error || "Could not create login.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        action={
          <button
            onClick={openAdd}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            + Add Doctor
          </button>
        }
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Specialty</th>
              <th className="px-5 py-2 font-medium">Slots</th>
              <th className="px-5 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : doctors.length ? (
              doctors.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100">
                  <td className="px-5 py-2">{doc.name}</td>
                  <td className="px-5 py-2">{doc.specialty}</td>
                  <td className="px-5 py-2">{doc.available_slots?.length ?? 0} slots</td>
                  <td className="px-5 py-2 text-right space-x-3">
                    <button onClick={() => openLoginModal(doc)} className="text-emerald-600 hover:underline">
                      Portal Login
                    </button>
                    <button onClick={() => openEdit(doc)} className="text-brand-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No doctors yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editingId ? "Edit Doctor" : "Add Doctor"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md">
            {editingId ? "Save Changes" : "Add Doctor"}
          </button>
        </form>
      </Modal>

      <Modal
        open={!!loginModalDoctor}
        title={`Portal Login — ${loginModalDoctor?.name ?? ""}`}
        onClose={() => setLoginModalDoctor(null)}
      >
        {loginResult ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Login created. Share these credentials with {loginModalDoctor?.name} securely —
              this temporary password won't be shown again.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Email:</span> {loginResult.login.email}</p>
              <p><span className="text-gray-500">Temporary password:</span> {loginResult.temporary_password}</p>
            </div>
            <button
              onClick={() => setLoginModalDoctor(null)}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateLogin} className="space-y-4">
            <p className="text-sm text-gray-500">
              This gives {loginModalDoctor?.name} their own portal login, scoped to only their own appointments.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="doctor@example.com"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md">
              Create Login
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
