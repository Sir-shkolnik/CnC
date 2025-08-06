from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="C&C CRM Test")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"success": True, "message": "Test API"}

@app.get("/")
async def root():
    return {"message": "C&C CRM Test"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
