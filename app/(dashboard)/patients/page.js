"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";

const emptyEdit = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  condition: "",
  doctor: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    condition: "",
    doctor: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  const loadDoctors = useCallback(async () => {
    try {
      const response = await api.get("/doctors", {
        params: { page: 1, limit: 50 },
      });
      setDoctors(response.data.data);
    } catch (err) {
      setDoctors([]);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: {
          page,
          limit: 8,
          search: filters.search || undefined,
          condition: filters.condition || undefined,
          doctor: filters.doctor || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });

      setPatients(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    if (page === 1) {
      loadPatients();
    } else {
      setPage(1);
    }
  };

  const startEdit = (patient) => {
    setEditingId(patient._id);
    setEditForm({
      name: patient.name || "",
      age: String(patient.age ?? ""),
      gender: patient.gender || "Male",
      phone: patient.phone || "",
      condition: patient.condition || "",
      doctor: patient.doctor?._id || patient.doctor || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEdit);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingId) return;

    setSaving(true);
    setError("");

    try {
      await api.put(`/patients/${editingId}`, {
        ...editForm,
        age: Number(editForm.age),
      });
      cancelEdit();
      await loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this patient?");
    if (!confirmed) return;

    try {
      await api.delete(`/patients/${id}`);
      if (editingId === id) cancelEdit();
      await loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete patient");
    }
  };

  return (
    <section>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Patients</h1>
        <p className="mt-1 text-sm text-slate-500">
          {pagination.total} patient{pagination.total === 1 ? "" : "s"} found
        </p>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5"
      >
        <input
          placeholder="Search"
          value={filters.search}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, search: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <input
          placeholder="Condition"
          value={filters.condition}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, condition: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <select
          value={filters.doctor}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, doctor: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, startDate: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, endDate: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:col-span-5 md:w-fit"
        >
          Apply filters
        </button>
      </form>

      {editingId ? (
        <form
          onSubmit={handleUpdate}
          className="mt-6 grid gap-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4 sm:grid-cols-2"
        >
          <p className="sm:col-span-2 text-sm font-medium text-slate-700">
            Edit patient
          </p>
          <input
            required
            placeholder="Name"
            value={editForm.name}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, name: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Age"
            value={editForm.age}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, age: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <select
            value={editForm.gender}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, gender: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            required
            placeholder="Phone"
            value={editForm.phone}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <input
            required
            placeholder="Condition"
            value={editForm.condition}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                condition: event.target.value,
              }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <select
            required
            value={editForm.doctor}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, doctor: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Update patient"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Gender</th>
                <th className="px-4 py-3 font-medium">Condition</th>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No patients found
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.age}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.condition}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.doctor?._id ? (
                        <Link
                          href={`/doctors/${patient.doctor._id}`}
                          className="text-teal-700 hover:underline"
                        >
                          {patient.doctor.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(patient)}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(patient._id)}
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
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
