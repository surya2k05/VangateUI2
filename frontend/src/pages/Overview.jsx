import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { PLANTS, MOTORS_SEED, SAMPLE_LOGS } from "../mock/mockData";

const COLORS = { healthy: "#2DC4B6", warning: "#F4A822", critical: "#C0392B" };

function Card({ children, className = "", testId }) {
  return (
    <div
      className={`rounded-lg p-5 ${className}`}
      style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function StatusCounter({ label, value, color, icon: Icon, blink, tid }) {
  return (
    <Card testId={tid} className="fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)" }}>{label}</div>
          <div className="mt-2 font-mono text-4xl font-bold" style={{ color }}>{value}</div>
          <div className="text-xs mt-1" style={{ color: "var(--vg-muted)" }}>Motors</div>
        </div>
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center ${blink ? "blink-critical" : ""}`}
          style={{ background: `${color}22`, color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export default function Overview() {
  const [plant, setPlant] = useState("VJNRJSW");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("vg_mock_logs");
    const allLogs = stored ? JSON.parse(stored) : SAMPLE_LOGS;
    setLogs(allLogs.slice(0, 8));
  }, [plant]);

  // Compute overview stats from local mockData
  const plantMotors = MOTORS_SEED.filter((m) => m.plant === plant);
  const healthy = plantMotors.filter((m) => m.status === "healthy").length;
  const warning = plantMotors.filter((m) => m.status === "warning").length;
  const critical = plantMotors.filter((m) => m.status === "critical").length;
  const total = plantMotors.length;

  const ov = { healthy, warning, critical, total };

  const donut = [
    { name: "Healthy", value: ov.healthy, key: "healthy" },
    { name: "Warning", value: ov.warning, key: "warning" },
    { name: "Critical", value: ov.critical, key: "critical" },
  ];

  return (
    <div className="p-6 space-y-6" data-testid="overview-page">
      {/* Toolbar */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <div className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--vg-muted)" }}>Overview</div>
          <h1 className="text-2xl font-semibold text-white">Motor Health Command Center</h1>
        </div>
        <Select value={plant} onValueChange={setPlant}>
          <SelectTrigger className="w-52 bg-[#0D1B3D] border-[#8799BA]/30 text-white" data-testid="overview-plant-select">
            <SelectValue placeholder="Select Plant" />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
            {PLANTS.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card testId="overview-donut-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)" }}>Motor Health Distribution</div>
              <div className="text-lg font-semibold text-white mt-1">Fleet Status</div>
            </div>
            <div className="font-mono text-3xl font-bold text-white">{ov.total}</div>
          </div>
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {donut.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0D1B3D", border: "1px solid #8799BA55", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {donut.map((d) => (
                <div key={d.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="status-dot" style={{ background: COLORS[d.key] }} />
                    <span className="text-sm text-white">{d.name}</span>
                  </div>
                  <div className="font-mono text-white">
                    {d.value}
                    <span className="text-xs ml-2" style={{ color: "var(--vg-muted)" }}>
                      {ov.total ? Math.round((d.value / ov.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card testId="overview-activity-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)" }}>Recent Activity</div>
              <div className="text-lg font-semibold text-white mt-1">Maintenance Log Stream</div>
            </div>
            <input
              type="date"
              defaultValue="2026-02-20"
              className="bg-[#091628] border border-[#8799BA]/30 text-white text-sm rounded-md px-2 py-1 font-mono"
              data-testid="overview-date-range"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-auto pr-2">
            {logs.length === 0 && <div className="text-sm text-[#8799BA]">No recent activity.</div>}
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 p-2 rounded hover:bg-white/5" data-testid={`activity-${l.id}`}>
                <Clock size={14} className="mt-1 text-[#00B4D8]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-mono text-[#00B4D8]">{l.motor_id}</span> · {l.category} by {l.technician}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--vg-muted)" }}>{l.notes}</div>
                </div>
                <div className="text-xs font-mono" style={{ color: "var(--vg-muted)" }}>{l.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCounter tid="counter-healthy" label="Healthy" value={ov.healthy} color={COLORS.healthy} icon={CheckCircle2} />
        <StatusCounter tid="counter-warning" label="Warning" value={ov.warning} color={COLORS.warning} icon={AlertTriangle} />
        <StatusCounter tid="counter-critical" label="Critical" value={ov.critical} color={COLORS.critical} icon={ShieldAlert} blink />
      </div>
    </div>
  );
}
