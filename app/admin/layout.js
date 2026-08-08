import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Control Center",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
