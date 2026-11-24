import os
import sys
from pathlib import Path

# Add backend directory to sys.path so core and assessment modules resolve
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from django.core.wsgi import get_wsgi_application

# Vercel serverless Python runtime looks for 'app'
app = get_wsgi_application()
