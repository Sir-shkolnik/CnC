# C&C CRM Modules Package
# Business logic modules for the C&C CRM system

__version__ = "1.0.0"
__author__ = "C&C CRM Team"

# Import all modules for easy access
from . import journey_engine
from . import gps_tracking
from . import media_upload
from . import notifications
from . import validation
from . import websocket_server

__all__ = [
    "journey_engine",
    "gps_tracking", 
    "media_upload",
    "notifications",
    "validation",
    "websocket_server"
] 