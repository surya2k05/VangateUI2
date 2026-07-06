import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(username, password);
      toast.success("Welcome back to VangateAI");
      nav("/", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--vg-canvas)" }}
      data-testid="login-page"
    >
      {/* Ambient grid */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(9,95,223,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,180,216,0.15), transparent 40%)",
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage:
          "linear-gradient(rgba(135,153,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(135,153,186,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <form
        onSubmit={submit}
        className="relative w-[420px] max-w-[92vw] p-8 rounded-lg fade-in"
        style={{ background: "var(--vg-card)", border: "1px solid var(--vg-border)" }}
        data-testid="login-form"
      >
        <div className="flex items-center gap-4 mb-8">
          <img
            src="https://cdn.phototourl.com/free/2026-07-06-b0e4955d-a8ab-447f-adcf-0c06c0afeac9.jpg"
            alt="VangateAI"
            className="h-20 w-auto rounded-lg glow-primary"
            data-testid="login-logo"
          />
          <div>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--vg-muted)" }}>VangateAI</div>
            <div className="text-lg font-semibold text-white">Vibration Analytics Platform</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-6">Log in</h1>

        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vg-muted)" }}>User Name</label>
        <Input
          data-testid="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1.5 mb-4 bg-[#091628] border-[#8799BA]/30 text-white"
          placeholder="admin"
          autoComplete="username"
        />

        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vg-muted)" }}>Password</label>
        <div className="relative mt-1.5 mb-4">
          <Input
            data-testid="login-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#091628] border-[#8799BA]/30 text-white pr-10"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            data-testid="login-toggle-visibility"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8799BA] hover:text-white"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2 text-[#8799BA] cursor-pointer">
            <Checkbox checked={remember} onCheckedChange={setRemember} data-testid="login-remember" />
            Remember me
          </label>
          <a href="#" className="text-[#00B4D8] hover:underline" data-testid="login-forgot">Forgot password?</a>
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="w-full text-white font-semibold glow-primary"
          style={{ background: "var(--vg-primary)" }}
          data-testid="login-submit"
        >
          {busy ? "Signing in..." : "Login"}
        </Button>

        <div className="text-[11px] text-center mt-6 font-mono" style={{ color: "var(--vg-muted)" }}>
          V: 01.00.00.0000
        </div>
      </form>
    </div>
  );
}
