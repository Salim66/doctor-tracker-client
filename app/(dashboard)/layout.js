import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
