export const PLANTS = [
  {"id": "VJNRJSW", "name": "VJNRJSW"},
  {"id": "PLANT_B", "name": "Plant B"},
];

export const MOTORS_SEED = [
  {"motor_id": "BRG02", "sensor_id": "JSW_02", "plant": "VJNRJSW", "department": "HSM", "area": "HSM3",
   "gateway": "Gateway1", "location": "Bearing Housing", "make": "SKF", "rpm": 1480, "status": "healthy"},
  {"motor_id": "GBX02", "sensor_id": "JSW_03", "plant": "VJNRJSW", "department": "HSM", "area": "HSM3",
   "gateway": "Gateway1", "location": "Gearbox Assembly", "make": "Flender", "rpm": 1750, "status": "healthy"},
  {"motor_id": "MOT03", "sensor_id": "VIB_01", "plant": "VJNRJSW", "department": "HSM", "area": "HSM3",
   "gateway": "Gateway1", "location": "Non-Driver End", "make": "Siemens Motor", "rpm": 2975, "status": "warning"},
  {"motor_id": "MOT04", "sensor_id": "VIB_02", "plant": "VJNRJSW", "department": "HSM", "area": "HSM3",
   "gateway": "Gateway1", "location": "Driver End", "make": "Siemens Motor", "rpm": 2975, "status": "critical"},
  {"motor_id": "MOT05", "sensor_id": "VIB_03", "plant": "VJNRJSW", "department": "HSM", "area": "HSM3",
   "gateway": "Gateway1", "location": "Descaler Pump", "make": "KSB Pump", "rpm": 2985, "status": "warning"},
];

export const ALARMS_SEED = [
  {"motor_id": "MOT03", "sensor_id": "VIB_01", "axis": "X", "rms_velocity": 3.89,
   "iso_severity": "Moderate", "indicator": "yellow", "timestamp": "2026-02-20T01:13:46"},
  {"motor_id": "MOT03", "sensor_id": "VIB_01", "axis": "X", "rms_velocity": 4.87,
   "iso_severity": "High", "indicator": "red", "timestamp": "2026-02-20T04:08:59"},
  {"motor_id": "MOT04", "sensor_id": "VIB_02", "axis": "X", "rms_velocity": 7.33,
   "iso_severity": "High", "indicator": "red", "timestamp": "2026-02-20T05:00:30"},
  {"motor_id": "MOT05", "sensor_id": "VIB_03", "axis": "Y", "rms_velocity": 6.72,
   "iso_severity": "Moderate", "indicator": "yellow", "timestamp": "2026-02-20T05:21:03"},
];

export const FAULTS_SEED = [
  {"motor_id": "MOT05", "sensor_id": "VIB_03", "fault_type": "Looseness", "direction": "Y", "severity": "Moderate",
   "details": "The vibration analysis indicates potential mechanical issues such as loose bolts, a weak base, or worn bearing housings. The measured velocity RMS is 6.72 mm/s, which exceeds the ISO threshold therefore, a detailed report has been generated.",
   "recommendation": "Looseness : Multiple harmonics (1X, 2X, 3X) suggest something is loose. Check foundation bolts, machine mounts, and bearing housings for looseness and tighten as needed.",
   "timestamp": "2026-02-20T05:21:03"},
  {"motor_id": "MOT05", "sensor_id": "VIB_03", "fault_type": "Electrical Anomaly", "direction": "Y", "severity": "Low",
   "details": "Electrical imbalance, VFD noise, or grounding issue. The measured velocity RMS is 6.72 mm/s, which exceeds the ISO threshold therefore, a detailed report has been generated.",
   "recommendation": "Electrical : Peaks detected; there may be a possibility of electrical interference. Please inspect power supply, VFD, and earthing connections.",
   "timestamp": "2026-02-20T05:21:03"},
  {"motor_id": "MOT04", "sensor_id": "VIB_02", "fault_type": "Misalignment", "direction": "X", "severity": "Critical",
   "details": "Shafts or couplings not aligned properly. The measured velocity RMS is 7.326 mm/s, which exceeds the ISO threshold therefore, a detailed report has been generated.",
   "recommendation": "Misalignment: Vibration pattern shows 1X and 2X components, indicating shaft or coupling misalignment. Please check and realign the coupling between motor and driven equipment.",
   "timestamp": "2026-02-20T05:00:30"},
  {"motor_id": "MOT04", "sensor_id": "VIB_02", "fault_type": "Electrical Anomaly", "direction": "X", "severity": "Low",
   "details": "Electrical imbalance, VFD noise, or grounding issue. The measured velocity RMS is 7.326 mm/s, which exceeds the ISO threshold therefore, a detailed report has been generated.",
   "recommendation": "Electrical : Peaks detected; there may be a possibility of electrical interference. Please inspect power supply, VFD, and earthing connections.",
   "timestamp": "2026-02-20T05:00:30"},
];

export const USERS_SEED = [
  {"username": "admin", "password": "Admin@123", "role": "Admin", "full_name": "Ada Admin"},
  {"username": "operator", "password": "Operator@123", "role": "Operator", "full_name": "Otto Operator"},
  {"username": "jsmith", "password": "Password@123", "role": "Technician", "full_name": "John Smith"},
  {"username": "kdas", "password": "Password@123", "role": "Analyst", "full_name": "Kavya Das"},
];

export const SAMPLE_LOGS = [
  {"id": "log-1", "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT04",
   "technician": "John Smith", "category": "Repair", "date": "2026-02-19",
   "notes": "Realigned coupling between motor and driven pump. Verified shaft concentricity.",
   "status": "Closed", "created_at": "2026-02-19T10:00:00Z"},
  {"id": "log-2", "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT05",
   "technician": "Kavya Das", "category": "Inspection", "date": "2026-02-18",
   "notes": "Foundation bolts inspected — 2 bolts torque below spec, tightened.",
   "status": "Closed", "created_at": "2026-02-18T10:00:00Z"},
  {"id": "log-3", "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT03",
   "technician": "John Smith", "category": "Maintenance", "date": "2026-02-17",
   "notes": "Greased NDE bearing. RMS velocity trending downward post service.",
   "status": "Open", "created_at": "2026-02-17T10:00:00Z"},
];

// Helper to generate mock trends
export function getMockTrend(motorId, feature, days = 30) {
  const motor = MOTORS_SEED.find(m => m.motor_id === motorId) || MOTORS_SEED[0];
  const baseline = {"healthy": 1.5, "warning": 4.0, "critical": 6.5}[motor.status] || 2.0;
  const points_accel = [];
  const points_vel = [];
  const now = new Date();
  
  for (let i = 0; i < days * 24; i++) {
    const ts = new Date(now.getTime() - (days * 24 - i) * 60 * 60 * 1000);
    const drift = 0.4 * Math.sin(i / 12.0) + 0.15 * Math.sin(i / 3.0);
    const noise = (Math.random() - 0.5) * 0.7;
    const vel = Math.max(0.1, baseline + drift + noise);
    const accel = Math.max(0.1, baseline * 1.6 + drift * 1.2 + noise * 1.4);
    points_vel.append ? points_vel.append : points_vel.push({"t": ts.toISOString(), "v": parseFloat(vel.toFixed(3))});
    points_accel.push({"t": ts.toISOString(), "v": parseFloat(accel.toFixed(3))});
  }
  return { motor_id: motorId, acceleration: points_accel, velocity: points_vel };
}

// Helper to generate mock FFT
export function getMockFFT(motorId) {
  const motor = MOTORS_SEED.find(m => m.motor_id === motorId) || MOTORS_SEED[0];
  const rpm = motor.rpm || 2975;
  const base_hz = rpm / 60.0;
  
  function spectrum(peaks) {
    const pts = [];
    for (let f = 0; f <= 500; f += 2) {
      let val = Math.random() * 0.13 + 0.02;
      for (const [mult, amp] of peaks) {
        const peak_hz = base_hz * mult;
        val += amp * Math.exp(-Math.pow(f - peak_hz, 2) / 12.0);
      }
      pts.push({ f, v: parseFloat(val.toFixed(4)) });
    }
    return pts;
  }
  
  const sev = {"healthy": 0.6, "warning": 1.4, "critical": 2.3}[motor.status] || 1.0;
  return {
    motor_id: motorId,
    base_hz: parseFloat(base_hz.toFixed(2)),
    acceleration: spectrum([[1, 2.2 * sev], [2, 1.3 * sev], [3, 0.7 * sev], [5, 0.4 * sev]]),
    velocity: spectrum([[1, 3.1 * sev], [2, 1.8 * sev], [3, 0.9 * sev]]),
    demodulation: spectrum([[1, 1.1 * sev], [4, 0.8 * sev], [7, 0.5 * sev]])
  };
}
