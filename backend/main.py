from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our modular files
from database import engine, Base, get_db
from routers import complaints, analytics, live
import crud

# Construct tables safely (Skips existing tables automatically)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI API",
    description="Backend engine driving exactly real-time intelligence for the react web dashboard.",
    version="1.0.0"
)

# Crucial CORS configuration ensures React port 3000 can talk to FastAPI port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register robust external router files
app.include_router(complaints.router)
app.include_router(analytics.router)
app.include_router(live.router) # Phase 13 Real-time Extension


@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "Online",
        "service": "CivicPulse AI",
        "swagger_docs": "/docs"
    }

# ==========================================
# Root-Level Topography Routes for Brevity
# ==========================================
@app.get("/clusters", tags=["Geography"])
def read_clusters(limit: int = 50, db: Session = Depends(get_db)):
    """Returns detected Incident Hotspots (Phase 7 output) to plot onto the Dashboard map."""
    cluster_objects = crud.get_clusters(db, limit=limit)
    return cluster_objects

@app.get("/departments", tags=["Departments"])
def read_departments(db: Session = Depends(get_db)):
    """Fetches valid routing department tables."""
    return crud.get_departments(db)

if __name__ == "__main__":
    import uvicorn
    # Hackathon-Safe auto-reload launching
    print("WARNING: Launching API on port 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
