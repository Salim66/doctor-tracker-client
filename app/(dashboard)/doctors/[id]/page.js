"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";

const emptyPatient = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  condition: "",
};

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id;

  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPatient);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [doctorRes, patientsRes] = await Promise.all([
        api.get(`/doctors/${doctorId}`),
        api.get(`/doctors/${doctorId}/patients`, {
          params: { page, limit: 8 },
        }),
      ]);

      setDoctor(doctorRes.data.data);
      setPatients(patientsRes.data.data);
      setPagination(patientsRes.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  }, [doctorId, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddPatient = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post(`/doctors/${doctorId}/patients`, {
        ...form,
        age: Number(form.age),
      });
      setForm(emptyPatient);
      setShowForm(false);
      setPage(1);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    const confirmed = window.confirm("Remove this patient from the doctor?");
    if (!confirmed) return;

    try {
      await api.delete(`/patients/${patientId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete patient");
    }
  };

  if (loading && !doctor) {
    return <p className="text-sm text-slate-500">Loading doctor...</p>;
  }

  if (!doctor) {
    return (
      <div>
        <p className="text-sm text-red-600">{error || "Doctor not found"}</p>
        <Link href="/doctors" className="mt-3 inline-block text-sm text-teal-700">
          Back to doctors
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Link href="/doctors" className="text-sm font-medium text-teal-700 hover:underline">
        Back to doctors
      </Link>

      <div className="panel p-5 sm:p-6">
        <h1 className="page-title">{doctor.name}</h1>
        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Specialization:</span>{" "}
            {doctor.specialization}
          </p>
          <p>
            <span className="font-medium text-slate-700">Hospital:</span>{" "}
            {doctor.hospital}
          </p>
          <p>
            <span className="font-medium text-slate-700">Phone:</span>{" "}
            {doctor.phone}
          </p>
          <p>
            <span className="font-medium text-slate-700">Email:</span>{" "}
            {doctor.email}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Patients</h2>
          <p className="page-subtitle">
            {pagination.total} patient{pagination.total === 1 ? "" : "s"} under
            this doctor
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? "Close form" : "Add patient"}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleAddPatient}
          className="panel grid gap-3 p-5 sm:grid-cols-2"
        >
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            className="field"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Age"
            value={form.age}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, age: event.target.value }))
            }
            className="field"
          />
          <select
            value={form.gender}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, gender: event.target.value }))
            }
            className="field"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            className="field"
          />
          <input
            required
            placeholder="Condition"
            value={form.condition}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, condition: event.target.value }))
            }
            className="field sm:col-span-2"
          />
          <button
            type="submit"
            disabled={saving}
            className="btn-primary sm:col-span-2 sm:w-fit"
          >
            {saving ? "Saving..." : "Save patient"}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="space-y-3 md:hidden">
        {patients.length === 0 ? (
          <div className="panel p-5 text-sm text-slate-500">No patients yet</div>
        ) : (
          patients.map((patient) => (
            <div key={patient._id} className="panel p-4">
              <p className="font-semibold text-slate-900">{patient.name}</p>
              <p className="mt-1 text-sm text-slate-500">{patient.condition}</p>
              <p className="mt-3 text-sm text-slate-600">
                {patient.gender} · Age {patient.age} · {patient.phone}
              </p>
              <button
                type="button"
                onClick={() => handleDeletePatient(patient._id)}
                className="btn-danger mt-4"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="panel hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Gender</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Condition</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No patients yet
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.age}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.gender}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.phone}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.condition}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeletePatient(patient._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}
