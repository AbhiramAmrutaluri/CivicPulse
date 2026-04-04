from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
import json
import asyncio
from datetime import datetime

router = APIRouter(prefix="/ws", tags=["Live Dashboard Broadcasting"])

class ConnectionManager:
    """
    Manages all active WebSocket connections securely.
    Ensures that if one tab closes, it does not crash the entire broadcast loop.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        message_str = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_str)
            except Exception:
                # Client ungracefully disconnected (e.g., closed laptop lid)
                self.disconnect(connection)

manager = ConnectionManager()


@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """
    Dedicated bidirectional WebSocket endpoint for the React Dashboard.
    It streams 'NEW_COMPLAINT' and 'ANALYTICS_REFRESH' events globally.
    """
    await manager.connect(websocket)
    try:
        # Keep the connection alive indefinitely
        while True:
            # We don't necessarily expect complex payload data from the dashboard client, 
            # but reading blocks the loop and keeps the socket alive.
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# =========================================================================
# HACKATHON SIMULATOR: HTTP Override
# In an enterprise production state, your PySpark pipeline or Kafka 
# consumer would directly publish to Redis Pub/Sub, which would trigger 
# the broadcast loop above. For a hackathon demo, we expose a POST route.
# =========================================================================

class DemoEvent(BaseModel):
    event_type: str = "NEW_COMPLAINT"
    payload: dict

@router.post("/trigger-event")
async def trigger_dashboard_event(event: DemoEvent):
    """
    Instantly flashes a live event onto all connected React screens.
    Connect an external Python script to loop this endpoint during judging!
    """
    event_data = {
        "type": event.event_type,
        "timestamp": datetime.now().isoformat(),
        "data": event.payload
    }
    await manager.broadcast(event_data)
    return {
        "status": "Broadcast Successful", 
        "connected_clients_reached": len(manager.active_connections)
    }
