"""
C&C CRM API Routes Package
All route modules for the C&C CRM API
"""

# Import all route modules
from . import auth
from . import journey
from . import calendar
from . import dispatch
from . import feedback
from . import crew
from . import storage
from . import media
from . import audit
from . import users
from . import mobile
from . import locations
from . import journey_steps
from . import admin
from . import setup
from . import real_time
from . import customers
from . import quotes
from . import journey_workflow
from . import super_admin

# Export all modules
__all__ = [
    "auth",
    "journey", 
    "calendar",
    "dispatch",
    "feedback",
    "crew",
    "storage",
    "media",
    "audit",
    "users",
    "mobile",
    "locations",
    "journey_steps",
    "admin",
    "setup",
    "real_time",
    "customers",
    "quotes",
    "journey_workflow",
    "super_admin"
]
