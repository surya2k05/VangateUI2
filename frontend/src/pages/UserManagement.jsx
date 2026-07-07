import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { USERS_SEED } from "../mock/mockData";

const ROLE_COLORS = { Admin: "#095FDF", Operator: "#00B4D8", Technician: "#2DC4B6", Analyst: "#F4A822" };

export default function UserManagement() {
  const [users] = useState(USERS_SEED.map(u => ({ ...u, date_joined: u.date_joined || "2026-02-20T10:00:00" })));

  return (
    <div className="p-6" data-testid="users-page">
      <div className="fade-in mb-6">
        <div className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--vg-muted)" }}>Administration</div>
        <h1 className="text-2xl font-semibold text-white">User Management</h1>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
        <Table>
          <TableHeader className="sticky top-0" style={{ background: "#091628" }}>
            <TableRow className="border-[#8799BA]/20">
              <TableHead className="text-[#8799BA] uppercase text-xs">User Name</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs">Full Name</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs">Date Joined</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.username} className="border-[#8799BA]/10 hover:bg-white/5" data-testid={`user-${u.username}`}>
                <TableCell className="font-semibold text-white">{u.username}</TableCell>
                <TableCell className="text-white text-sm">{u.full_name}</TableCell>
                <TableCell className="font-mono text-xs text-[#8799BA]">{(u.date_joined || "").slice(0, 19).replace("T", " ")}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono"
                    style={{ background: `${ROLE_COLORS[u.role] || "#8799BA"}22`, color: ROLE_COLORS[u.role] || "#8799BA" }}>
                    {u.role}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
