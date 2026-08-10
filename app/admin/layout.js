import { AdminShell } from "@/components/admin/AdminShell";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/security/session.js";

export const metadata = {
  title: "Control Center",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  const serverAuthenticated = verifyAdminSessionToken(token);

  return <AdminShell serverAuthenticated={serverAuthenticated}>{children}</AdminShell>;
}
