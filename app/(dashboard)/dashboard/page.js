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

const COLORS = ["#0f766e", "#0369a1", "#b45309", "#be123c", "#0e7490", "#15803d"];

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
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of doctors, patients, and clinic trends
          </p>
        </div>
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="field max-w-[180px]"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel overflow-hidden p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total doctors</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                {stats?.totals?.doctors ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
              Staff
            </div>
          </div>
        </div>
        <div className="panel overflow-hidden p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total patients</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                {stats?.totals?.patients ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
              Records
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Patients per doctor
          </h2>
          <div className="mt-4 h-72 min-h-[18rem] w-full">
            {patientsPerDoctor.length === 0 ? (
              <p className="text-sm text-slate-500">No patient data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientsPerDoctor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-900">
            New patients by date
          </h2>
          <div className="mt-4 h-72 min-h-[18rem] w-full">
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
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Patients by condition
        </h2>
        <div className="mt-4 h-80 min-h-[20rem] w-full">
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
