import { useEffect, useState } from "react";
import { http } from "@/lib/api";
import { Bot, Download, Pencil, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import HierarchyTree from "@/components/HierarchyTree";
import AiFlyout from "@/components/AiFlyout";
import { toast } from "sonner";

const STATUS = { healthy: "#2DC4B6", warning: "#F4A822", critical: "#C0392B" };
const SEV = { Low: "#2DC4B6", Moderate: "#F4A822", High: "#F4A822", Warning: "#F4A822", Critical: "#C0392B" };

function ChartCard({ title, feature, onFeature, children, testId }) {
  return (
    <div className="rounded-lg p-4" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }} data-testid={testId}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        {onFeature && (
          <Select value={feature} onValueChange={onFeature}>
            <SelectTrigger className="w-36 h-8 bg-[#091628] border-[#8799BA]/30 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
              <SelectItem value="rms">RMS</SelectItem>
              <SelectItem value="crest">Crest Factor</SelectItem>
              <SelectItem value="peak">Peak</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="h-56">{children}</div>
    </div>
  );
}

function TrendChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(135,153,186,0.1)" strokeDasharray="3 3" />
        <XAxis dataKey="t" tick={{ fill: "#8799BA", fontSize: 10 }} tickFormatter={(t) => (t || "").slice(5, 10)} minTickGap={40} />
        <YAxis tick={{ fill: "#8799BA", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "#0D1B3D", border: "1px solid #8799BA55", color: "#fff" }} labelFormatter={(l) => (l || "").slice(0, 16)} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function FFTChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(135,153,186,0.1)" strokeDasharray="3 3" />
        <XAxis dataKey="f" tick={{ fill: "#8799BA", fontSize: 10 }} label={{ value: "Hz", position: "insideBottomRight", offset: -5, fill: "#8799BA", fontSize: 10 }} />
        <YAxis tick={{ fill: "#8799BA", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "#0D1B3D", border: "1px solid #8799BA55", color: "#fff" }} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function PlantHierarchy() {
  const [tree, setTree] = useState([]);
  const [motorId, setMotorId] = useState("MOT04");
  const [motor, setMotor] = useState(null);
  const [trend, setTrend] = useState({ acceleration: [], velocity: [] });
  const [fft, setFft] = useState({ acceleration: [], velocity: [], demodulation: [] });
  const [faults, setFaults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("trend");
  const [accelFeat, setAccelFeat] = useState("rms");
  const [velFeat, setVelFeat] = useState("rms");
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    http.get("/hierarchy").then((r) => setTree(r.data));
  }, []);

  useEffect(() => {
    if (!motorId) return;
    http.get(`/motors/${motorId}`).then((r) => setMotor(r.data));
    http.get(`/telemetry/trend/${motorId}?feature=${accelFeat}`).then((r) => setTrend(r.data));
    http.get(`/telemetry/fft/${motorId}`).then((r) => setFft(r.data));
    http.get(`/faults?motor_id=${motorId}`).then((r) => setFaults(r.data));
    http.get(`/logs?motor_id=${motorId}`).then((r) => setLogs(r.data));
  }, [motorId, accelFeat]);

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify({ motor, faults, logs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${motorId}-report.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const deleteLog = async (id) => {
    await http.delete(`/logs/${id}`);
    setLogs((l) => l.filter((x) => x.id !== id));
    toast.success("Log deleted");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]" data-testid="hierarchy-page">
      {/* Left tree */}
      <aside className="w-72 shrink-0 overflow-auto p-3" style={{ background: "#0A1932", borderRight: "1px solid var(--vg-border)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: "var(--vg-muted)" }}>Plant Hierarchy</div>
        <HierarchyTree data={tree} selectedMotor={motorId} onSelectMotor={setMotorId} />
      </aside>

      {/* Workspace */}
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Banner */}
        <div className="px-6 py-4 border-b border-[#8799BA]/20 flex items-center gap-6 flex-wrap fade-in" style={{ background: "#0A1932" }}>
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)" }}>Motor</div>
            <div className="font-mono text-xl font-bold text-white flex items-center gap-2">
              {motor?.motor_id}
              {motor && <span className="status-dot" style={{ background: STATUS[motor.status] }} />}
            </div>
          </div>
          <Info label="Plant" val={motor?.plant} />
          <Info label="Department" val={motor?.department} />
          <Info label="Sensor" val={motor?.sensor_id} />
          <Info label="Last Sync" val="2026-02-20 05:30" />
          <Info label="RPM" val={motor?.rpm} highlight />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-[#091628] border border-[#8799BA]/20 p-1">
              <TabsTrigger value="trend" data-testid="tab-trend" className="data-[state=active]:bg-[#0D1B3D] data-[state=active]:text-[#00B4D8] text-[#8799BA]">Trend</TabsTrigger>
              <TabsTrigger value="fft" data-testid="tab-fft" className="data-[state=active]:bg-[#0D1B3D] data-[state=active]:text-[#00B4D8] text-[#8799BA]">FFT</TabsTrigger>
              <TabsTrigger value="faults" data-testid="tab-faults" className="data-[state=active]:bg-[#0D1B3D] data-[state=active]:text-[#00B4D8] text-[#8799BA]">Faults</TabsTrigger>
              <TabsTrigger value="logs" data-testid="tab-logs" className="data-[state=active]:bg-[#0D1B3D] data-[state=active]:text-[#00B4D8] text-[#8799BA]">Logs</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => setAiOpen(true)}
              className="text-white glow-primary"
              style={{ background: "var(--vg-primary)" }}
              data-testid="ask-assistant-btn"
            >
              <Bot size={16} className="mr-2" /> Ask Assistant
            </Button>
          </div>

          <TabsContent value="trend" className="space-y-4 fade-in">
            <ChartCard title="Acceleration Trend" feature={accelFeat} onFeature={setAccelFeat} testId="chart-accel-trend">
              <TrendChart data={trend.acceleration} color="#00B4D8" />
            </ChartCard>
            <ChartCard title="Velocity Trend" feature={velFeat} onFeature={setVelFeat} testId="chart-vel-trend">
              <TrendChart data={trend.velocity} color="#2DC4B6" />
            </ChartCard>
          </TabsContent>

          <TabsContent value="fft" className="space-y-4 fade-in">
            <ChartCard title={`Acceleration FFT (base ${fft.base_hz || 0} Hz)`} testId="chart-accel-fft">
              <FFTChart data={fft.acceleration} color="#00B4D8" />
            </ChartCard>
            <ChartCard title="Velocity FFT" testId="chart-vel-fft">
              <FFTChart data={fft.velocity} color="#F4A822" />
            </ChartCard>
            <ChartCard title="Demodulation FFT" testId="chart-demod-fft">
              <FFTChart data={fft.demodulation} color="#095FDF" />
            </ChartCard>
          </TabsContent>

          <TabsContent value="faults" className="space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#8799BA]">
                Detected faults for <span className="font-mono text-[#00B4D8]">{motorId}</span>
              </div>
              <Button onClick={downloadReport} variant="outline" size="sm"
                className="bg-transparent border-[#8799BA]/30 text-white hover:bg-white/5" data-testid="download-report">
                <Download size={14} className="mr-2" /> Download Report
              </Button>
            </div>

            <div className="rounded-lg overflow-hidden" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
              <div className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)", borderBottom: "1px solid var(--vg-border)" }}>
                Fault Detections
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#8799BA]/20">
                    <TableHead className="text-[#8799BA] text-xs">Fault Type</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Direction</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Severity</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Details</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faults.map((f, i) => (
                    <TableRow key={i} className="border-[#8799BA]/10" data-testid={`fault-row-${i}`}>
                      <TableCell className="text-white text-sm">{f.fault_type}</TableCell>
                      <TableCell className="font-mono text-white">{f.direction}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span className="status-dot" style={{ background: SEV[f.severity] || "#8799BA" }} />
                          {f.severity}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#8799BA] max-w-md">{f.details}</TableCell>
                      <TableCell className="font-mono text-xs text-white">{f.timestamp}</TableCell>
                    </TableRow>
                  ))}
                  {faults.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-[#8799BA]">No faults detected.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-lg overflow-hidden" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
              <div className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: "var(--vg-muted)", borderBottom: "1px solid var(--vg-border)" }}>
                Recommendations
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#8799BA]/20">
                    <TableHead className="text-[#8799BA] text-xs w-24">Direction</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Recommended Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faults.map((f, i) => (
                    <TableRow key={i} className="border-[#8799BA]/10">
                      <TableCell className="font-mono text-white">{f.direction}</TableCell>
                      <TableCell className="text-sm text-white">{f.recommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="fade-in">
            <div className="rounded-lg overflow-hidden" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#8799BA]/20">
                    <TableHead className="text-[#8799BA] text-xs">Date</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Technician</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Category</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Status</TableHead>
                    <TableHead className="text-[#8799BA] text-xs">Notes</TableHead>
                    <TableHead className="text-[#8799BA] text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id} className="border-[#8799BA]/10" data-testid={`log-${l.id}`}>
                      <TableCell className="font-mono text-white">{l.date}</TableCell>
                      <TableCell className="text-white text-sm">{l.technician}</TableCell>
                      <TableCell className="text-white text-sm">{l.category}</TableCell>
                      <TableCell className="text-sm">
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono"
                          style={{ background: l.status === "Closed" ? "#2DC4B622" : "#F4A82222", color: l.status === "Closed" ? "#2DC4B6" : "#F4A822" }}>
                          {l.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#8799BA] max-w-md">{l.notes}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button className="p-1 text-[#8799BA] hover:text-white" data-testid={`edit-${l.id}`}><Pencil size={14} /></button>
                          <button onClick={() => deleteLog(l.id)} className="p-1 text-[#8799BA] hover:text-[#C0392B]" data-testid={`del-${l.id}`}><Trash2 size={14} /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-6 text-[#8799BA]">No logs.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AiFlyout open={aiOpen} onClose={() => setAiOpen(false)} motorId={motorId} />
    </div>
  );
}

function Info({ label, val, highlight }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--vg-muted)" }}>{label}</div>
      <div className={`font-mono ${highlight ? "text-[#00B4D8]" : "text-white"}`}>{val || "—"}</div>
    </div>
  );
}
