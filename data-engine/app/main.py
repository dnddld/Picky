"""
Picky Data Engine - 새로운 간단한 버전
체류시간, 스크롤깊이, 활성상태만 수집하는 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os

app = FastAPI(
    title="Picky Data Engine", 
    description="간단한 브라우징 데이터 수집 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"], 
    allow_headers=["*"],
)

# MongoDB 연결
mongo_client = None
database = None

class BrowsingData(BaseModel):
    """브라우징 데이터 모델 - Google OAuth 사용자 포함"""
    url: str
    domain: str
    title: str
    timestamp: str
    timeSpent: int           # 체류시간(초)
    maxScrollDepth: int      # 최대 스크롤 깊이(%)
    isActive: bool           # 활성 상태
    userId: str              # Google 사용자 ID (이메일)

@app.on_event("startup")
async def startup():
    """앱 시작시 MongoDB 연결"""
    global mongo_client, database
    
    # MongoDB 연결 (로컬 개발용)
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    mongo_client = AsyncIOMotorClient(mongo_url)
    database = mongo_client.picky
    
    print("✅ MongoDB 연결 완료")

@app.on_event("shutdown") 
async def shutdown():
    """앱 종료시 MongoDB 연결 해제"""
    global mongo_client
    
    if mongo_client:
        mongo_client.close()
        print("✅ MongoDB 연결 해제")

@app.get("/")
def root():
    """루트 엔드포인트"""
    return {
        "service": "Picky Data Engine",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    """서버 상태 확인"""
    return {"status": "healthy"}

@app.post("/browsing-data")
async def save_browsing_data(data: BrowsingData) -> Dict[str, Any]:
    """브라우징 데이터 저장"""
    try:
        # 저장할 데이터 구성
        save_data = {
            "url": data.url,
            "domain": data.domain, 
            "title": data.title,
            "timestamp": data.timestamp,
            "timeSpent": data.timeSpent,
            "maxScrollDepth": data.maxScrollDepth,
            "isActive": data.isActive,
            "userId": data.userId,              # Google 사용자 ID
            
            # 서버에서 추가
            "savedAt": datetime.utcnow().isoformat()
        }
        
        # MongoDB에 저장
        collection = database.browsing_data
        result = await collection.insert_one(save_data)
        
        print(f"📊 데이터 저장: {data.domain} ({data.timeSpent}초) - 사용자: {data.userId}")
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "데이터 저장 완료"
        }
        
    except Exception as e:
        print(f"❌저장 실패: {e}")
        raise HTTPException(status_code=500, detail=f"저장 실패: {str(e)}")

@app.get("/users/{user_id}/data")
async def get_user_data(user_id: str, limit: int = 50) -> Dict[str, Any]:
    """사용자별 브라우징 데이터 조회 (새로 추가)"""
    try:
        collection = database.browsing_data
        
        # 사용자별 데이터 조회
        cursor = collection.find(
            {"userId": user_id}
        ).sort("savedAt", -1).limit(limit)
        
        data_list = await cursor.to_list(length=limit)
        
        # ObjectId를 문자열로 변환
        for item in data_list:
            item["_id"] = str(item["_id"])
        
        return {
            "success": True,
            "userId": user_id,
            "count": len(data_list),
            "data": data_list
        }
        
    except Exception as e:
        print(f"❌ 데이터 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"데이터 조회 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)