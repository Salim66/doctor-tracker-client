"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/api";

const COLORS = ["#0f766e", "#0369a1", "#b45309", "#be123c", "#7c3aed", "#15803d"];

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/dashboard/stats", {
          params: { days },
        });
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [days]);

  if (loading && !stats) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  if (error && !stats) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
        {error}
      </p>
    );
  }

  const patientsPerDoctor = (stats?.patientsPerDoctor || []).map((item) => ({
    name: item.doctorName,
    patients: item.patientCount,
  }));

  const patientsByDate = stats?.patientsByDate || [];
  const patientsByCondition = (stats?.patientsByCondition || []).map((item) => ({
    name: item.condition,
    value: item.count,
  }));

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of doctors, patients, and trends
          </p>
        </div>
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total doctors</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">
            {stats?.totals?.doctors ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total patients</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">
            {stats?.totals?.patients ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-800">
            Patients per doctor
          </h2>
          <div className="mt-4 h-72">
            {patientsPerDoctor.length === 0 ? (
              <p className="text-sm text-slate-500">No patient data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientsPerDoctor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-800">
            New patients by date
          </h2>
          <div className="mt-4 h-72">
            {patientsByDate.length === 0 ? (
              <p className="text-sm text-slate-500">
                No patients in the selected range
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientsByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0369a1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-800">
          Patients by condition
        </h2>
        <div className="mt-4 h-80">
          {patientsByCondition.length === 0 ? (
            <p className="text-sm text-slate-500">No condition data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientsByCondition}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {patientsByCondition.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
