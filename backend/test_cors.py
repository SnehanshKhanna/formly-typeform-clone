from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
response = client.options(
    "/api/health",
    headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
)
print("HEADERS:", dict(response.headers))
if response.headers.get("access-control-allow-origin") == "http://localhost:3000":
    print("CORS OK")
else:
    print("CORS FAILED")
