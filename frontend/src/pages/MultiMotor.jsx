import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MOTORS_SEED, FAULTS_SEED } from "../mock/mockData";

const STATUS_COLORS = { healthy: "#2DC4B6", warning: "#F4A822", critical: "#C0392B" };
const STATUS_LABEL = { healthy: "Healthy", warning: "Warning", critical: "Critical" };

export default function MultiMotor() {
  const [motorF, setMotorF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [faultF, setFaultF] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Enrich motors local list
  const enrichedMotors = useMemo(() => {
    return MOTORS_SEED.map((m) => {
      const f = FAULTS_SEED.find((x) => x.motor_id === m.motor_id);
      return {
        ...m,
        recent_fault: f ? f.fault_type : "-",
        last_updated: f ? f.timestamp.slice(0, 19).replace("T", " ") : "-"
      };
    });
  }, []);

  const faultsList = useMemo(
    () => Array.from(new Set(enrichedMotors.map((m) => m.recent_fault).filter((v) => v && v !== "-"))),
    [enrichedMotors]
  );

  const filtered = useMemo(() => {
    return enrichedMotors.filter((m) => {
      const matchMotor = motorF === "all" || m.motor_id === motorF;
      const matchStatus = statusF === "all" || m.status === statusF;
      const matchFault = faultF === "all" || m.recent_fault === faultF;
      return matchMotor && matchStatus && matchFault;
    });
  }, [enrichedMotors, motorF, statusF, faultF]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div className="p-6 space-y-6" data-testid="multi-motor-page">
      <div className="fade-in">
        <div className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--vg-muted)" }}>Alarms</div>
        <h1 className="text-2xl font-semibold text-white">Multi-Motor Telemetry</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={motorF} onValueChange={(val) => { setMotorF(val); setPage(1); }}>
          <SelectTrigger className="bg-[#0D1B3D] border-[#8799BA]/30 text-white" data-testid="filter-motor">
            <SelectValue placeholder="Motor" />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
            <SelectItem value="all">All Motors</SelectItem>
            {enrichedMotors.map((m) => <SelectItem key={m.motor_id} value={m.motor_id}>{m.motor_id}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusF} onValueChange={(val) => { setStatusF(val); setPage(1); }}>
          <SelectTrigger className="bg-[#0D1B3D] border-[#8799BA]/30 text-white" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={faultF} onValueChange={(val) => { setFaultF(val); setPage(1); }}>
          <SelectTrigger className="bg-[#0D1B3D] border-[#8799BA]/30 text-white" data-testid="filter-fault">
            <SelectValue placeholder="Fault" />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
            <SelectItem value="all">All Faults</SelectItem>
            {faultsList.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#8799BA]/20 hover:bg-transparent">
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">Motor</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">Status</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">Last Updated</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">Fault</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">Recent Fault</TableHead>
              <TableHead className="text-[#8799BA] uppercase text-xs tracking-wider">RPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((m) => (
              <TableRow key={m.motor_id} className="border-[#8799BA]/10 hover:bg-white/5" data-testid={`row-${m.motor_id}`}>
                <TableCell className="font-mono text-white">{m.motor_id}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="status-dot" style={{ background: STATUS_COLORS[m.status] }} />
                    <span className="text-sm text-white">{STATUS_LABEL[m.status]}</span>
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-white">{m.last_updated}</TableCell>
                <TableCell className="text-sm text-white">{m.recent_fault}</TableCell>
                <TableCell className="text-sm text-[#00B4D8]">{m.recent_fault}</TableCell>
                <TableCell className="font-mono text-white">{m.rpm}</TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-[#8799BA] py-8">No motors match filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between p-3 border-t border-[#8799BA]/20">
          <div className="text-xs font-mono" style={{ color: "var(--vg-muted)" }}>
            Page {page} of {totalPages} · {filtered.length} results
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="bg-transparent border-[#8799BA]/30 text-white hover:bg-white/5" data-testid="page-prev">Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="bg-transparent border-[#8799BA]/30 text-white hover:bg-white/5" data-testid="page-next">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
