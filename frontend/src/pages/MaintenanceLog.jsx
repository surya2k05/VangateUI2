import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PLANTS, MOTORS_SEED, USERS_SEED, SAMPLE_LOGS } from "../mock/mockData";

const CATEGORIES = ["Repair", "Maintenance", "Inspection", "Calibration", "Replacement"];

export default function MaintenanceLog() {
  const [plants] = useState(PLANTS);
  const [motors, setMotors] = useState([]);
  const [technicians] = useState(USERS_SEED);
  const [form, setForm] = useState({
    plant: "VJNRJSW",
    department: "HSM",
    motor_id: "",
    technician: "",
    category: "Maintenance",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [dateOpen, setDateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (form.plant) {
      const filteredMotors = MOTORS_SEED.filter((m) => m.plant === form.plant);
      setMotors(filteredMotors);
    }
  }, [form.plant]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.motor_id || !form.technician || !form.notes.trim()) {
      toast.error("Please fill motor, technician, and notes.");
      return;
    }
    setBusy(true);
    try {
      const stored = localStorage.getItem("vg_mock_logs");
      const allLogs = stored ? JSON.parse(stored) : SAMPLE_LOGS;
      
      const newEntry = {
        id: `log-${Date.now()}`,
        plant: form.plant,
        department: form.department,
        motor_id: form.motor_id,
        technician: form.technician,
        category: form.category,
        date: form.date,
        notes: form.notes,
        status: "Open",
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem("vg_mock_logs", JSON.stringify([newEntry, ...allLogs]));
      toast.success("Maintenance log saved");
      setForm({ ...form, notes: "" });
    } catch (e) {
      toast.error("Failed to save log");
    } finally {
      setBusy(false);
    }
  };

  const departments = [{ id: "HSM", name: "HSM" }, { id: "BOF", name: "BOF" }];

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="maintenance-page">
      <div className="text-center mb-8 fade-in">
        <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--vg-muted)" }}>Writeback</div>
        <h1 className="text-3xl font-semibold text-white mt-1">Maintenance Log</h1>
        <div className="text-sm mt-1" style={{ color: "var(--vg-muted)" }}>Record actions taken on motors and sensors.</div>
      </div>

      <div className="rounded-lg p-6 space-y-4" style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Plant">
            <Select value={form.plant} onValueChange={(v) => set("plant", v)}>
              <SelectTrigger data-testid="log-plant" className="bg-[#091628] border-[#8799BA]/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
                {plants.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Department">
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger data-testid="log-department" className="bg-[#091628] border-[#8799BA]/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Motor">
            <Select value={form.motor_id} onValueChange={(v) => set("motor_id", v)}>
              <SelectTrigger data-testid="log-motor" className="bg-[#091628] border-[#8799BA]/30 text-white"><SelectValue placeholder="Select motor" /></SelectTrigger>
              <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
                {motors.map((m) => <SelectItem key={m.motor_id} value={m.motor_id}>{m.motor_id} · {m.location}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Category">
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger data-testid="log-category" className="bg-[#091628] border-[#8799BA]/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Technician">
            <Select value={form.technician} onValueChange={(v) => set("technician", v)}>
              <SelectTrigger data-testid="log-technician" className="bg-[#091628] border-[#8799BA]/30 text-white"><SelectValue placeholder="Select technician" /></SelectTrigger>
              <SelectContent className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
                {technicians.map((t) => <SelectItem key={t.username} value={t.full_name || t.username}>{t.full_name || t.username}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Date">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-[#091628] border-[#8799BA]/30 text-white hover:bg-white/5" data-testid="log-date">
                  <CalendarIcon size={14} className="mr-2" />
                  <span className="font-mono">{form.date}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-[#0D1B3D] border-[#8799BA]/30 p-0">
                <Calendar
                  mode="single"
                  selected={new Date(form.date)}
                  onSelect={(d) => { if (d) { set("date", format(d, "yyyy-MM-dd")); setDateOpen(false); } }}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Describe the actions taken, readings observed, tools used, next steps…"
            className="bg-[#091628] border-[#8799BA]/30 text-white min-h-32"
            data-testid="log-notes"
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setForm({ ...form, notes: "" })}
            className="bg-transparent border-[#8799BA]/30 text-white hover:bg-white/5" data-testid="log-cancel">Cancel</Button>
          <Button onClick={submit} disabled={busy}
            className="text-white glow-primary" style={{ background: "var(--vg-primary)" }} data-testid="log-save">
            {busy ? "Saving..." : "Save Log"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--vg-muted)" }}>{label}</div>
      {children}
    </div>
  );
}
