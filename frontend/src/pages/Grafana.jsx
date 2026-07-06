export default function Grafana() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="grafana-page">
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--vg-border)", background: "#0A1932" }}>
        <div>
          <div className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--vg-muted)" }}>Insights</div>
          <h1 className="text-xl font-semibold text-white">Grafana Dashboards</h1>
        </div>
        <div className="text-xs font-mono" style={{ color: "var(--vg-muted)" }}>play.grafana.org</div>
      </div>
      <div className="flex-1 min-h-0" style={{ background: "var(--vg-canvas)" }}>
        <iframe
          title="Grafana"
          src="https://play.grafana.org/d/000000012/grafana-play-home?orgId=1&kiosk"
          className="w-full h-full border-0"
          data-testid="grafana-iframe"
        />
      </div>
    </div>
  );
}
