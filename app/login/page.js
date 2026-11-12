"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isAuthenticated, setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@doctortracker.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;
      setAuth(token, user);
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(3,105,161,0.14),transparent_30%),linear-gradient(180deg,#ecf6f5_0%,#f8fafc_45%,#eef6f8_100%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-100">Doctor Tracker</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Every doctor and patient in one clear admin view
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-teal-50/90">
              Search records, review analytics, and manage clinic data with a
              clean workflow built for everyday use.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-teal-100">Secure login</p>
              <p className="mt-1 font-semibold">JWT protected</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-teal-100">Live insights</p>
              <p className="mt-1 font-semibold">Charts ready</p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="md:hidden">
            <p className="text-sm font-semibold text-teal-700">Doctor Tracker</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Sign in to continue
            </h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage doctors and patients
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
