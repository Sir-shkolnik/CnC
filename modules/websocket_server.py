"""
WebSocket Server - Real-time communication for journey updates
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Set, Optional
from datetime import datetime
from enum import Enum
import uuid

# ===== ENUMS =====

class WebSocketEventType(str, Enum):
    STATUS_UPDATE = "status_update"
    CREW_UPDATE = "crew_update"
    MEDIA_UPLOAD = "media_upload"
    CHAT_MESSAGE = "chat_message"
    GPS_UPDATE = "gps_update"
    JOURNEY_CREATED = "journey_created"
    JOURNEY_DELETED = "journey_deleted"
    CREW_ASSIGNED = "crew_assigned"
    ENTRY_ADDED = "entry_added"

# ===== WEBSOCKET SERVER =====

class WebSocketServer:
    """WebSocket server for real-time journey updates"""
    
    def __init__(self):
        self.connections: Dict[str, Dict[str, Any]] = {}  # connection_id -> connection_info
        self.journey_subscriptions: Dict[str, Set[str]] = {}  # journey_id -> set of connection_ids
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of connection_ids
        self.logger = logging.getLogger(__name__)
    
    async def connect(self, websocket, connection_id: str, user_id: str, user_role: str, client_id: str, location_id: str):
        """Handle new WebSocket connection"""
        
        connection_info = {
            "websocket": websocket,
            "user_id": user_id,
            "user_role": user_role,
            "client_id": client_id,
            "location_id": location_id,
            "connected_at": datetime.utcnow().isoformat() + "Z",
            "subscribed_journeys": set()
        }
        
        self.connections[connection_id] = connection_info
        
        # Track user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(connection_id)
        
        self.logger.info(f"WebSocket connected: {connection_id} for user {user_id}")
        
        # Send welcome message
        await self.send_to_connection(connection_id, {
            "type": "connection_established",
            "data": {
                "connection_id": connection_id,
                "user_id": user_id,
                "timestamp": connection_info["connected_at"]
            }
        })
    
    async def disconnect(self, connection_id: str):
        """Handle WebSocket disconnection"""
        
        if connection_id not in self.connections:
            return
        
        connection_info = self.connections[connection_id]
        user_id = connection_info["user_id"]
        
        # Remove from journey subscriptions
        for journey_id in connection_info["subscribed_journeys"]:
            if journey_id in self.journey_subscriptions:
                self.journey_subscriptions[journey_id].discard(connection_id)
                if not self.journey_subscriptions[journey_id]:
                    del self.journey_subscriptions[journey_id]
        
        # Remove from user connections
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(connection_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove connection
        del self.connections[connection_id]
        
        self.logger.info(f"WebSocket disconnected: {connection_id}")
    
    async def subscribe_to_journey(self, connection_id: str, journey_id: str) -> bool:
        """Subscribe connection to journey updates"""
        
        if connection_id not in self.connections:
            return False
        
        # Add to journey subscriptions
        if journey_id not in self.journey_subscriptions:
            self.journey_subscriptions[journey_id] = set()
        self.journey_subscriptions[journey_id].add(connection_id)
        
        # Update connection info
        self.connections[connection_id]["subscribed_journeys"].add(journey_id)
        
        # Send subscription confirmation
        await self.send_to_connection(connection_id, {
            "type": "journey_subscribed",
            "data": {
                "journey_id": journey_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        })
        
        self.logger.info(f"Connection {connection_id} subscribed to journey {journey_id}")
        return True
    
    async def unsubscribe_from_journey(self, connection_id: str, journey_id: str) -> bool:
        """Unsubscribe connection from journey updates"""
        
        if connection_id not in self.connections:
            return False
        
        # Remove from journey subscriptions
        if journey_id in self.journey_subscriptions:
            self.journey_subscriptions[journey_id].discard(connection_id)
            if not self.journey_subscriptions[journey_id]:
                del self.journey_subscriptions[journey_id]
        
        # Update connection info
        self.connections[connection_id]["subscribed_journeys"].discard(journey_id)
        
        # Send unsubscription confirmation
        await self.send_to_connection(connection_id, {
            "type": "journey_unsubscribed",
            "data": {
                "journey_id": journey_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        })
        
        self.logger.info(f"Connection {connection_id} unsubscribed from journey {journey_id}")
        return True
    
    async def broadcast_journey_update(self, journey_id: str, event_type: WebSocketEventType, data: Dict[str, Any], exclude_user: str = None):
        """Broadcast journey update to all subscribed connections"""
        
        if journey_id not in self.journey_subscriptions:
            return
        
        message = {
            "type": event_type.value,
            "data": data,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "journey_id": journey_id
        }
        
        # Send to all subscribed connections
        for connection_id in self.journey_subscriptions[journey_id]:
            connection_info = self.connections.get(connection_id)
            if connection_info and connection_info["user_id"] != exclude_user:
                await self.send_to_connection(connection_id, message)
        
        self.logger.info(f"Broadcasted {event_type.value} to {len(self.journey_subscriptions[journey_id])} connections for journey {journey_id}")
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to all connections of a specific user"""
        
        if user_id not in self.user_connections:
            return
        
        for connection_id in self.user_connections[user_id]:
            await self.send_to_connection(connection_id, message)
    
    async def send_to_connection(self, connection_id: str, message: Dict[str, Any]):
        """Send message to specific connection"""
        
        if connection_id not in self.connections:
            return
        
        try:
            websocket = self.connections[connection_id]["websocket"]
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            self.logger.error(f"Failed to send message to connection {connection_id}: {e}")
            # Mark connection for cleanup
            await self.disconnect(connection_id)
    
    async def handle_message(self, connection_id: str, message: Dict[str, Any]):
        """Handle incoming WebSocket message"""
        
        if connection_id not in self.connections:
            return
        
        message_type = message.get("type")
        
        if message_type == "subscribe_journey":
            journey_id = message.get("data", {}).get("journey_id")
            if journey_id:
                await self.subscribe_to_journey(connection_id, journey_id)
        
        elif message_type == "unsubscribe_journey":
            journey_id = message.get("data", {}).get("journey_id")
            if journey_id:
                await self.unsubscribe_from_journey(connection_id, journey_id)
        
        elif message_type == "chat_message":
            journey_id = message.get("data", {}).get("journey_id")
            if journey_id:
                # Broadcast chat message to all journey subscribers
                await self.broadcast_journey_update(
                    journey_id, 
                    WebSocketEventType.CHAT_MESSAGE, 
                    message.get("data", {}),
                    exclude_user=self.connections[connection_id]["user_id"]
                )
        
        elif message_type == "gps_update":
            journey_id = message.get("data", {}).get("journey_id")
            if journey_id:
                # Broadcast GPS update to all journey subscribers
                await self.broadcast_journey_update(
                    journey_id, 
                    WebSocketEventType.GPS_UPDATE, 
                    message.get("data", {})
                )
        
        else:
            self.logger.warning(f"Unknown message type: {message_type}")
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket server statistics"""
        
        total_connections = len(self.connections)
        total_journey_subscriptions = sum(len(subscribers) for subscribers in self.journey_subscriptions.values())
        total_user_connections = sum(len(connections) for connections in self.user_connections.values())
        
        return {
            "total_connections": total_connections,
            "total_journey_subscriptions": total_journey_subscriptions,
            "total_user_connections": total_user_connections,
            "active_journeys": len(self.journey_subscriptions),
            "active_users": len(self.user_connections)
        }
    
    async def cleanup_inactive_connections(self):
        """Clean up inactive connections"""
        
        current_time = datetime.utcnow()
        connections_to_remove = []
        
        for connection_id, connection_info in self.connections.items():
            # Check if connection is still active (implement heartbeat mechanism)
            # For now, just log the cleanup
            pass
        
        for connection_id in connections_to_remove:
            await self.disconnect(connection_id)

# ===== JOURNEY EVENT HANDLERS =====

class JourneyEventBroadcaster:
    """Helper class to broadcast journey events"""
    
    def __init__(self, websocket_server: WebSocketServer):
        self.ws_server = websocket_server
    
    async def journey_created(self, journey_data: Dict[str, Any]):
        """Broadcast journey creation event"""
        
        await self.ws_server.broadcast_journey_update(
            journey_data["id"],
            WebSocketEventType.JOURNEY_CREATED,
            {
                "journey": journey_data,
                "created_by": journey_data.get("createdBy")
            }
        )
    
    async def journey_status_updated(self, journey_id: str, old_status: str, new_status: str, user_id: str):
        """Broadcast journey status update"""
        
        await self.ws_server.broadcast_journey_update(
            journey_id,
            WebSocketEventType.STATUS_UPDATE,
            {
                "old_status": old_status,
                "new_status": new_status,
                "updated_by": user_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
    
    async def crew_assigned(self, journey_id: str, crew_data: List[Dict[str, Any]], user_id: str):
        """Broadcast crew assignment"""
        
        await self.ws_server.broadcast_journey_update(
            journey_id,
            WebSocketEventType.CREW_ASSIGNED,
            {
                "crew": crew_data,
                "assigned_by": user_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
    
    async def media_uploaded(self, journey_id: str, media_data: List[Dict[str, Any]], user_id: str):
        """Broadcast media upload"""
        
        await self.ws_server.broadcast_journey_update(
            journey_id,
            WebSocketEventType.MEDIA_UPLOAD,
            {
                "media": media_data,
                "uploaded_by": user_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
    
    async def entry_added(self, journey_id: str, entry_data: Dict[str, Any], user_id: str):
        """Broadcast journey entry addition"""
        
        await self.ws_server.broadcast_journey_update(
            journey_id,
            WebSocketEventType.ENTRY_ADDED,
            {
                "entry": entry_data,
                "added_by": user_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )

# ===== INSTANCES =====

websocket_server = WebSocketServer()
journey_event_broadcaster = JourneyEventBroadcaster(websocket_server) 