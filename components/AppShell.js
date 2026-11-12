"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "Analytics overview" },
  { href: "/doctors", label: "Doctors", hint: "Manage doctor records" },
  { href: "/patients", label: "Patients", hint: "Manage patient records" },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const nav = (
    <>
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white">
            DT
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Doctor Tracker</p>
            <p className="text-xs text-slate-500">Clinic admin portal</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-3">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3.5 py-3 transition ${
                active
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="block text-sm font-semibold">{link.label}</span>
              <span
                className={`mt-0.5 block text-xs ${
                  active ? "text-teal-50/90" : "text-slate-400"
                }`}
              >
                {link.hint}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <p className="truncate text-sm font-semibold text-slate-800">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email || ""}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-secondary mt-3 w-full"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur lg:flex">
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <p className="text-sm font-semibold text-slate-800">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Menu
            </button>
            <p className="text-sm font-semibold text-slate-800">Doctor Tracker</p>
            <div className="w-[64px]" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
