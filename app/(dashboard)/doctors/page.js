"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";

const emptyForm = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    hospital: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/doctors", {
        params: {
          page,
          limit: 8,
          search: filters.search || undefined,
          specialization: filters.specialization || undefined,
          hospital: filters.hospital || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });

      setDoctors(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    if (page === 1) {
      loadDoctors();
    } else {
      setPage(1);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/doctors", form);
      setForm(emptyForm);
      setShowForm(false);
      setPage(1);
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this doctor and all related patients?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/doctors/${id}`);
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete doctor");
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Doctors</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} doctor{pagination.total === 1 ? "" : "s"} found
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          {showForm ? "Close form" : "Add doctor"}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
        >
          {Object.keys(emptyForm).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium capitalize text-slate-700">
                {field}
              </label>
              <input
                required
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [field]: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save doctor"}
            </button>
          </div>
        </form>
      ) : null}

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
          placeholder="Specialization"
          value={filters.specialization}
          onChange={(event) =>
            setFilters((prev) => ({
              ...prev,
              specialization: event.target.value,
            }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <input
          placeholder="Hospital"
          value={filters.hospital}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, hospital: event.target.value }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
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
                <th className="px-4 py-3 font-medium">Specialization</th>
                <th className="px-4 py-3 font-medium">Hospital</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading doctors...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No doctors found
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {doctor.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {doctor.specialization}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doctor.hospital}</td>
                    <td className="px-4 py-3 text-slate-600">{doctor.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{doctor.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(doctor._id)}
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
