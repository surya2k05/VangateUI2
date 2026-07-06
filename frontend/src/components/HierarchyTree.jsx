import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Cpu, Server, Layers, HardDrive, Radio } from "lucide-react";

const STATUS = { healthy: "#2DC4B6", warning: "#F4A822", critical: "#C0392B" };

function Node({ label, icon: Icon, depth, expanded, onToggle, active, onClick, dot, testId }) {
  return (
    <div
      onClick={onClick || onToggle}
      className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors ${
        active ? "bg-[#095FDF]/20 text-white border-l-2 border-[#095FDF]" : "text-[#8799BA] hover:bg-white/5 hover:text-white"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      data-testid={testId}
    >
      {onToggle ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="text-[#8799BA]"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      ) : <span className="w-3.5" />}
      <Icon size={14} />
      <span className="flex-1 truncate">{label}</span>
      {dot && <span className="status-dot" style={{ background: STATUS[dot] }} />}
    </div>
  );
}

export default function HierarchyTree({ data, selectedMotor, onSelectMotor }) {
  const [openPlants, setOpenPlants] = useState({});
  const [openDepts, setOpenDepts] = useState({});
  const [openAreas, setOpenAreas] = useState({});
  const [openGates, setOpenGates] = useState({});

  // auto expand full path on data load
  useEffect(() => {
    if (!data || data.length === 0) return;
    const p = data[0];
    const d = p.departments?.[0];
    const a = d?.areas?.[0];
    const g = a?.gateways?.[0];
    setOpenPlants((s) => ({ ...s, [p.id]: true }));
    if (d) setOpenDepts((s) => ({ ...s, [d.id]: true }));
    if (a) setOpenAreas((s) => ({ ...s, [a.id]: true }));
    if (g) setOpenGates((s) => ({ ...s, [g.id]: true }));
  }, [data]);

  const toggle = (setter, key) => setter((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-0.5" data-testid="hierarchy-tree">
      {data.map((plant) => (
        <div key={plant.id}>
          <Node
            label={plant.name}
            icon={Server}
            depth={0}
            expanded={openPlants[plant.id]}
            onToggle={() => toggle(setOpenPlants, plant.id)}
            testId={`node-plant-${plant.id}`}
          />
          {openPlants[plant.id] && plant.departments.map((dept) => (
            <div key={dept.id}>
              <Node
                label={dept.name}
                icon={Layers}
                depth={1}
                expanded={openDepts[dept.id]}
                onToggle={() => toggle(setOpenDepts, dept.id)}
                testId={`node-dept-${dept.id}`}
              />
              {openDepts[dept.id] && dept.areas.map((area) => (
                <div key={area.id}>
                  <Node
                    label={area.name}
                    icon={HardDrive}
                    depth={2}
                    expanded={openAreas[area.id]}
                    onToggle={() => toggle(setOpenAreas, area.id)}
                    testId={`node-area-${area.id}`}
                  />
                  {openAreas[area.id] && area.gateways.map((gw) => (
                    <div key={gw.id}>
                      <Node
                        label={gw.name}
                        icon={Radio}
                        depth={3}
                        expanded={openGates[gw.id]}
                        onToggle={() => toggle(setOpenGates, gw.id)}
                        testId={`node-gw-${gw.id}`}
                      />
                      {openGates[gw.id] && gw.motors.map((mot) => (
                        <Node
                          key={mot.motor_id}
                          label={`${mot.motor_id} · ${mot.sensor_id}`}
                          icon={Cpu}
                          depth={4}
                          active={selectedMotor === mot.motor_id}
                          onClick={() => onSelectMotor(mot.motor_id)}
                          dot={mot.status}
                          testId={`tree-motor-${mot.motor_id}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
