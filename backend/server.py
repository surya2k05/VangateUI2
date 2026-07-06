from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import random
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXP_HOURS = int(os.environ['JWT_EXP_HOURS'])
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="VangateAI Vibration Analytics Platform")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ================== Seed Data ==================
PLANTS = [
    {"id": "VJNRJSW", "name": "VJNRJSW"},
    {"id": "PLANT_B", "name": "Plant B"},
]

MOTORS_SEED = [
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
]

ALARMS_SEED = [
    {"motor_id": "MOT03", "sensor_id": "VIB_01", "axis": "X", "rms_velocity": 3.89,
     "iso_severity": "Moderate", "indicator": "yellow", "timestamp": "2026-02-20T01:13:46"},
    {"motor_id": "MOT03", "sensor_id": "VIB_01", "axis": "X", "rms_velocity": 4.87,
     "iso_severity": "High", "indicator": "red", "timestamp": "2026-02-20T04:08:59"},
    {"motor_id": "MOT04", "sensor_id": "VIB_02", "axis": "X", "rms_velocity": 7.33,
     "iso_severity": "High", "indicator": "red", "timestamp": "2026-02-20T05:00:30"},
    {"motor_id": "MOT05", "sensor_id": "VIB_03", "axis": "Y", "rms_velocity": 6.72,
     "iso_severity": "Moderate", "indicator": "yellow", "timestamp": "2026-02-20T05:21:03"},
]

FAULTS_SEED = [
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
]

USERS_SEED = [
    {"username": "admin", "password": "Admin@123", "role": "Admin", "full_name": "Ada Admin"},
    {"username": "operator", "password": "Operator@123", "role": "Operator", "full_name": "Otto Operator"},
    {"username": "jsmith", "password": "Password@123", "role": "Technician", "full_name": "John Smith"},
    {"username": "kdas", "password": "Password@123", "role": "Analyst", "full_name": "Kavya Das"},
]

# ================== Models ==================
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant: str
    department: str
    motor_id: str
    technician: str
    category: str
    date: str
    notes: str
    status: str = "Open"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LogCreate(BaseModel):
    plant: str
    department: str
    motor_id: str
    technician: str
    category: str
    date: str
    notes: str
    status: Optional[str] = "Open"

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    session_id: str
    motor_id: Optional[str] = None
    message: str

# ================== Auth ==================
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_token(username: str, role: str) -> str:
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"username": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ================== Seed ==================
async def seed_all():
    if await db.users.count_documents({}) == 0:
        for u in USERS_SEED:
            await db.users.insert_one({
                "username": u["username"],
                "password_hash": hash_password(u["password"]),
                "role": u["role"],
                "full_name": u["full_name"],
                "date_joined": datetime.now(timezone.utc).isoformat(),
            })
    if await db.motors.count_documents({}) == 0:
        await db.motors.insert_many([dict(m) for m in MOTORS_SEED])
    if await db.alarms.count_documents({}) == 0:
        await db.alarms.insert_many([dict(a) for a in ALARMS_SEED])
    if await db.faults.count_documents({}) == 0:
        await db.faults.insert_many([dict(f) for f in FAULTS_SEED])
    if await db.logs.count_documents({}) == 0:
        sample_logs = [
            {"id": str(uuid.uuid4()), "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT04",
             "technician": "John Smith", "category": "Repair", "date": "2026-02-19",
             "notes": "Realigned coupling between motor and driven pump. Verified shaft concentricity.",
             "status": "Closed", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT05",
             "technician": "Kavya Das", "category": "Inspection", "date": "2026-02-18",
             "notes": "Foundation bolts inspected — 2 bolts torque below spec, tightened.",
             "status": "Closed", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "plant": "VJNRJSW", "department": "HSM", "motor_id": "MOT03",
             "technician": "John Smith", "category": "Maintenance", "date": "2026-02-17",
             "notes": "Greased NDE bearing. RMS velocity trending downward post service.",
             "status": "Open", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.logs.insert_many(sample_logs)

# ================== Routes ==================
@api.get("/")
async def root():
    return {"message": "VangateAI Portal API"}

@api.post("/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await db.users.find_one({"username": body.username})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_token(user["username"], user["role"])
    return TokenResponse(
        access_token=token,
        user={"username": user["username"], "role": user["role"], "full_name": user["full_name"]},
    )

@api.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current

@api.get("/plants")
async def get_plants():
    return PLANTS

@api.get("/hierarchy")
async def get_hierarchy():
    motors = await db.motors.find({}, {"_id": 0}).to_list(1000)
    tree = {}
    for m in motors:
        p = tree.setdefault(m["plant"], {"id": m["plant"], "name": m["plant"], "departments": {}})
        d = p["departments"].setdefault(m["department"], {"id": m["department"], "name": m["department"], "areas": {}})
        a = d["areas"].setdefault(m["area"], {"id": m["area"], "name": m["area"], "gateways": {}})
        g = a["gateways"].setdefault(m["gateway"], {"id": m["gateway"], "name": m["gateway"], "motors": []})
        g["motors"].append(m)
    # flatten
    def to_list(node, key):
        node[key] = list(node[key].values())
        for child in node[key]:
            if "departments" in child:
                to_list(child, "departments")
            if "areas" in child:
                to_list(child, "areas")
            if "gateways" in child:
                to_list(child, "gateways")
        return node
    root_node = {"plants": tree}
    to_list(root_node, "plants")
    return root_node["plants"]

@api.get("/motors")
async def get_motors(plant: Optional[str] = None, status_f: Optional[str] = None, fault: Optional[str] = None):
    q = {}
    if plant: q["plant"] = plant
    if status_f and status_f != "all": q["status"] = status_f
    motors = await db.motors.find(q, {"_id": 0}).to_list(1000)
    # enrich with latest fault
    for m in motors:
        f = await db.faults.find_one({"motor_id": m["motor_id"]}, {"_id": 0}, sort=[("timestamp", -1)])
        m["recent_fault"] = f["fault_type"] if f else "-"
        m["last_updated"] = f["timestamp"] if f else "-"
    if fault and fault != "all":
        motors = [m for m in motors if m["recent_fault"] == fault]
    return motors

@api.get("/motors/{motor_id}")
async def get_motor(motor_id: str):
    m = await db.motors.find_one({"motor_id": motor_id}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Motor not found")
    return m

@api.get("/overview")
async def overview(plant: Optional[str] = None):
    q = {"plant": plant} if plant else {}
    motors = await db.motors.find(q, {"_id": 0}).to_list(1000)
    counts = {"healthy": 0, "warning": 0, "critical": 0}
    for m in motors:
        counts[m["status"]] = counts.get(m["status"], 0) + 1
    return {
        "total": len(motors),
        "healthy": counts["healthy"],
        "warning": counts["warning"],
        "critical": counts["critical"],
    }

@api.get("/alarms")
async def get_alarms(plant: Optional[str] = None, limit: int = 20):
    alarms = await db.alarms.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return alarms

@api.get("/faults")
async def get_faults(motor_id: Optional[str] = None):
    q = {"motor_id": motor_id} if motor_id else {}
    return await db.faults.find(q, {"_id": 0}).to_list(500)

@api.get("/telemetry/trend/{motor_id}")
async def trend(motor_id: str, feature: str = "rms", days: int = 30):
    """Generate mock time-series for acceleration & velocity."""
    motor = await db.motors.find_one({"motor_id": motor_id}, {"_id": 0})
    if not motor:
        raise HTTPException(404, "Motor not found")
    random.seed(hash(motor_id + feature) & 0xFFFFFFFF)
    now = datetime.now(timezone.utc)
    points_accel = []
    points_vel = []
    baseline = {"healthy": 1.5, "warning": 4.0, "critical": 6.5}.get(motor["status"], 2.0)
    for i in range(days * 24):
        ts = now - timedelta(hours=(days * 24 - i))
        drift = 0.4 * math.sin(i / 12.0) + 0.15 * math.sin(i / 3.0)
        noise = random.uniform(-0.35, 0.35)
        vel = max(0.1, baseline + drift + noise)
        accel = max(0.1, baseline * 1.6 + drift * 1.2 + noise * 1.4)
        points_vel.append({"t": ts.isoformat(), "v": round(vel, 3)})
        points_accel.append({"t": ts.isoformat(), "v": round(accel, 3)})
    return {"motor_id": motor_id, "acceleration": points_accel, "velocity": points_vel}

@api.get("/telemetry/fft/{motor_id}")
async def fft(motor_id: str):
    motor = await db.motors.find_one({"motor_id": motor_id}, {"_id": 0})
    if not motor:
        raise HTTPException(404, "Motor not found")
    random.seed(hash(motor_id) & 0xFFFFFFFF)
    rpm = motor.get("rpm", 2975)
    base_hz = rpm / 60.0
    def spectrum(peaks_mult):
        pts = []
        for f in range(0, 501, 2):
            val = random.uniform(0.02, 0.15)
            for mult, amp in peaks_mult:
                peak_hz = base_hz * mult
                val += amp * math.exp(-((f - peak_hz) ** 2) / 12.0)
            pts.append({"f": f, "v": round(val, 4)})
        return pts
    sev = {"healthy": 0.6, "warning": 1.4, "critical": 2.3}.get(motor["status"], 1.0)
    return {
        "motor_id": motor_id,
        "base_hz": round(base_hz, 2),
        "acceleration": spectrum([(1, 2.2 * sev), (2, 1.3 * sev), (3, 0.7 * sev), (5, 0.4 * sev)]),
        "velocity": spectrum([(1, 3.1 * sev), (2, 1.8 * sev), (3, 0.9 * sev)]),
        "demodulation": spectrum([(1, 1.1 * sev), (4, 0.8 * sev), (7, 0.5 * sev)]),
    }

@api.get("/logs", response_model=List[LogEntry])
async def get_logs(motor_id: Optional[str] = None):
    q = {"motor_id": motor_id} if motor_id else {}
    docs = await db.logs.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api.post("/logs", response_model=LogEntry)
async def create_log(body: LogCreate, current=Depends(get_current_user)):
    entry = LogEntry(**body.model_dump())
    await db.logs.insert_one(entry.model_dump())
    return entry

@api.delete("/logs/{log_id}")
async def delete_log(log_id: str, current=Depends(get_current_user)):
    res = await db.logs.delete_one({"id": log_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Log not found")
    return {"ok": True}

@api.get("/users")
async def get_users(current=Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

@api.get("/technicians")
async def get_technicians():
    users = await db.users.find({}, {"_id": 0, "username": 1, "full_name": 1, "role": 1}).to_list(500)
    return users

# ================== Chat (SSE Streaming) ==================
@api.post("/chat/stream")
async def chat_stream(body: ChatRequest, current=Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    # Persist user message
    await db.chat_messages.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": body.session_id,
        "role": "user",
        "content": body.message,
        "motor_id": body.motor_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    context_parts = ["You are VangateAI Assistant, an expert in industrial motor vibration analytics, ISO 10816 severity, FFT interpretation, and predictive maintenance. Be concise, technical, and actionable."]
    if body.motor_id:
        motor = await db.motors.find_one({"motor_id": body.motor_id}, {"_id": 0})
        faults = await db.faults.find({"motor_id": body.motor_id}, {"_id": 0}).to_list(20)
        alarms = await db.alarms.find({"motor_id": body.motor_id}, {"_id": 0}).sort("timestamp", -1).to_list(10)
        context_parts.append(f"Current motor context: {motor}")
        if faults:
            context_parts.append(f"Recent faults: {faults}")
        if alarms:
            context_parts.append(f"Recent alarms: {alarms}")
    system = "\n".join(context_parts)

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=body.session_id,
        system_message=system,
    ).with_model("openai", "gpt-5.2")

    async def generator():
        collected = []
        try:
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    collected.append(ev.content)
                    yield f"data: {ev.content}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            yield f"data: [error: {str(e)}]\n\n"
        finally:
            full = "".join(collected)
            await db.chat_messages.insert_one({
                "id": str(uuid.uuid4()),
                "session_id": body.session_id,
                "role": "assistant",
                "content": full,
                "motor_id": body.motor_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            yield "data: [DONE]\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

@api.get("/chat/history/{session_id}")
async def chat_history(session_id: str, current=Depends(get_current_user)):
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return msgs

# ================== App ==================
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def on_startup():
    await seed_all()
    logger.info("Seed complete")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()
