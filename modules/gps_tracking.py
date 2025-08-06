"""
GPS Tracking Module - Location tracking and route management
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import math
import uuid

# ===== GPS UTILITIES =====

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two GPS coordinates using Haversine formula"""
    
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate bearing between two GPS coordinates"""
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    
    y = math.sin(dlon) * math.cos(lat2_rad)
    x = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon)
    
    bearing = math.atan2(y, x)
    bearing = math.degrees(bearing)
    
    return (bearing + 360) % 360

# ===== GPS TRACKING =====

class GPSTracker:
    """GPS tracking and location management"""
    
    def __init__(self):
        self.tracks = {}  # journey_id -> track_data
        self.active_tracking = set()  # Set of journey IDs being actively tracked
    
    def start_tracking(self, journey_id: str, initial_location: Dict[str, float]) -> bool:
        """Start GPS tracking for a journey"""
        
        if journey_id in self.active_tracking:
            return False
        
        track_data = {
            "journey_id": journey_id,
            "start_time": datetime.utcnow().isoformat() + "Z",
            "end_time": None,
            "points": [],
            "total_distance": 0.0,
            "current_location": initial_location,
            "is_active": True
        }
        
        # Add initial point
        self.add_tracking_point(journey_id, initial_location)
        
        self.tracks[journey_id] = track_data
        self.active_tracking.add(journey_id)
        
        return True
    
    def stop_tracking(self, journey_id: str) -> bool:
        """Stop GPS tracking for a journey"""
        
        if journey_id not in self.active_tracking:
            return False
        
        if journey_id in self.tracks:
            self.tracks[journey_id]["end_time"] = datetime.utcnow().isoformat() + "Z"
            self.tracks[journey_id]["is_active"] = False
        
        self.active_tracking.discard(journey_id)
        
        return True
    
    def add_tracking_point(self, journey_id: str, location: Dict[str, float], 
                          speed: Optional[float] = None, accuracy: Optional[float] = None) -> bool:
        """Add a GPS tracking point"""
        
        if journey_id not in self.tracks:
            return False
        
        track = self.tracks[journey_id]
        
        point = {
            "id": f"point_{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latitude": location["lat"],
            "longitude": location["lng"],
            "speed": speed,
            "accuracy": accuracy
        }
        
        # Calculate distance from previous point
        if track["points"]:
            prev_point = track["points"][-1]
            distance = calculate_distance(
                prev_point["latitude"], prev_point["longitude"],
                point["latitude"], point["longitude"]
            )
            point["distance_from_previous"] = distance
            track["total_distance"] += distance
        else:
            point["distance_from_previous"] = 0.0
        
        track["points"].append(point)
        track["current_location"] = location
        
        return True
    
    def get_current_location(self, journey_id: str) -> Optional[Dict[str, float]]:
        """Get current location for a journey"""
        
        if journey_id not in self.tracks:
            return None
        
        return self.tracks[journey_id]["current_location"]
    
    def get_track_summary(self, journey_id: str) -> Optional[Dict[str, Any]]:
        """Get tracking summary for a journey"""
        
        if journey_id not in self.tracks:
            return None
        
        track = self.tracks[journey_id]
        
        # Calculate statistics
        total_points = len(track["points"])
        if total_points < 2:
            return {
                "journey_id": journey_id,
                "total_distance": 0.0,
                "total_points": total_points,
                "duration": 0.0,
                "average_speed": 0.0,
                "is_active": track["is_active"]
            }
        
        # Calculate duration
        start_time = datetime.fromisoformat(track["start_time"].replace("Z", "+00:00"))
        end_time = datetime.fromisoformat(track["end_time"].replace("Z", "+00:00")) if track["end_time"] else datetime.utcnow()
        duration_hours = (end_time - start_time).total_seconds() / 3600
        
        # Calculate average speed
        average_speed = track["total_distance"] / duration_hours if duration_hours > 0 else 0.0
        
        return {
            "journey_id": journey_id,
            "total_distance": round(track["total_distance"], 2),
            "total_points": total_points,
            "duration": round(duration_hours, 2),
            "average_speed": round(average_speed, 2),
            "is_active": track["is_active"],
            "start_time": track["start_time"],
            "end_time": track["end_time"],
            "current_location": track["current_location"]
        }
    
    def get_track_points(self, journey_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get tracking points for a journey"""
        
        if journey_id not in self.tracks:
            return []
        
        track = self.tracks[journey_id]
        return track["points"][-limit:]  # Return last N points
    
    def is_tracking_active(self, journey_id: str) -> bool:
        """Check if tracking is active for a journey"""
        
        return journey_id in self.active_tracking

# ===== ROUTE OPTIMIZATION =====

class RouteOptimizer:
    """Route optimization and planning"""
    
    def __init__(self):
        self.routes = {}  # route_id -> route_data
    
    def calculate_route(self, start_location: Dict[str, float], 
                       end_location: Dict[str, float], 
                       waypoints: List[Dict[str, float]] = None) -> Dict[str, Any]:
        """Calculate optimal route between points"""
        
        route_id = f"route_{uuid.uuid4().hex[:8]}"
        
        # Simple route calculation (in production, use Google Maps API or similar)
        total_distance = 0.0
        route_points = [start_location]
        
        if waypoints:
            for waypoint in waypoints:
                route_points.append(waypoint)
        
        route_points.append(end_location)
        
        # Calculate total distance
        for i in range(len(route_points) - 1):
            distance = calculate_distance(
                route_points[i]["lat"], route_points[i]["lng"],
                route_points[i + 1]["lat"], route_points[i + 1]["lng"]
            )
            total_distance += distance
        
        route_data = {
            "id": route_id,
            "start_location": start_location,
            "end_location": end_location,
            "waypoints": waypoints or [],
            "route_points": route_points,
            "total_distance": round(total_distance, 2),
            "estimated_duration": round(total_distance / 50, 2),  # Assume 50 km/h average
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        self.routes[route_id] = route_data
        
        return route_data
    
    def get_route(self, route_id: str) -> Optional[Dict[str, Any]]:
        """Get route by ID"""
        
        return self.routes.get(route_id)
    
    def optimize_multiple_stops(self, locations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Optimize route for multiple stops (simple nearest neighbor)"""
        
        if len(locations) <= 2:
            return locations
        
        # Simple nearest neighbor algorithm
        unvisited = locations[1:]  # Skip start location
        current = locations[0]
        optimized_route = [current]
        
        while unvisited:
            # Find nearest unvisited location
            nearest = min(unvisited, key=lambda loc: calculate_distance(
                current["lat"], current["lng"],
                loc["lat"], loc["lng"]
            ))
            
            optimized_route.append(nearest)
            unvisited.remove(nearest)
            current = nearest
        
        return optimized_route

# ===== LOCATION SERVICES =====

class LocationService:
    """Location-based services and utilities"""
    
    def __init__(self):
        self.geofences = {}  # geofence_id -> geofence_data
    
    def create_geofence(self, center: Dict[str, float], radius_km: float, 
                       name: str, description: str = None) -> str:
        """Create a geofence"""
        
        geofence_id = f"geofence_{uuid.uuid4().hex[:8]}"
        
        geofence_data = {
            "id": geofence_id,
            "name": name,
            "description": description,
            "center": center,
            "radius_km": radius_km,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        self.geofences[geofence_id] = geofence_data
        
        return geofence_id
    
    def is_location_in_geofence(self, location: Dict[str, float], geofence_id: str) -> bool:
        """Check if location is within a geofence"""
        
        if geofence_id not in self.geofences:
            return False
        
        geofence = self.geofences[geofence_id]
        distance = calculate_distance(
            location["lat"], location["lng"],
            geofence["center"]["lat"], geofence["center"]["lng"]
        )
        
        return distance <= geofence["radius_km"]
    
    def get_nearby_geofences(self, location: Dict[str, float], max_distance_km: float = 10.0) -> List[Dict[str, Any]]:
        """Get geofences near a location"""
        
        nearby = []
        
        for geofence in self.geofences.values():
            distance = calculate_distance(
                location["lat"], location["lng"],
                geofence["center"]["lat"], geofence["center"]["lng"]
            )
            
            if distance <= max_distance_km:
                nearby.append({
                    **geofence,
                    "distance_km": round(distance, 2)
                })
        
        return sorted(nearby, key=lambda x: x["distance_km"])
    
    def calculate_eta(self, current_location: Dict[str, float], 
                     destination: Dict[str, float], 
                     average_speed_kmh: float = 50.0) -> Dict[str, Any]:
        """Calculate estimated time of arrival"""
        
        distance = calculate_distance(
            current_location["lat"], current_location["lng"],
            destination["lat"], destination["lng"]
        )
        
        estimated_hours = distance / average_speed_kmh
        estimated_minutes = estimated_hours * 60
        
        eta_time = datetime.utcnow() + timedelta(hours=estimated_hours)
        
        return {
            "distance_km": round(distance, 2),
            "estimated_hours": round(estimated_hours, 2),
            "estimated_minutes": round(estimated_minutes, 2),
            "eta_time": eta_time.isoformat() + "Z",
            "average_speed_kmh": average_speed_kmh
        }

# ===== INSTANCES =====

gps_tracker = GPSTracker()
route_optimizer = RouteOptimizer()
location_service = LocationService() 