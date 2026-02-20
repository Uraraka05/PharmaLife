from mangum import Mangum
from.main import app # Import your FastAPI app instance

# This is the entry point for Netlify
handler = Mangum(app)