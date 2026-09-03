import os

PORT = int(os.getenv("PORT", 8000))
print(f"FastAPI app running on port {PORT}")
