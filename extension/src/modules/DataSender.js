/**
 * DataSender.js
 * 
 * Python 서버로 데이터 전송하는 로직
 */

export class DataSender {
  constructor() {
    // 서버 설정
    this.serverUrl = "http://localhost:8000"; // Python FastAPI 서버
    this.dataQueue = []; // 전송 대기 데이터
    
    console.log("📤 DataSender 초기화");
  }

  /**
   * 데이터를 큐에 추가 (사용자 ID 포함)
   */
  addToQueue(data, userId = null) {
    // 사용자 ID 추가
    const dataWithUser = {
      ...data,
      userId: userId,
      timestamp: new Date().toISOString()
    };
    
    this.dataQueue.push(dataWithUser);
    console.log("📥 데이터 큐에 추가:", this.dataQueue.length, "개", userId ? `(${userId})` : "(no user)");
  }

  /**
   * Python 서버로 데이터 전송
   */
  async sendData(data) {
    try {
      console.log("📤 서버로 데이터 전송 중...");
      
      const response = await fetch(`${this.serverUrl}/browsing-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ 전송 성공:", result);
        return true;
      } else {
        console.error("❌ 전송 실패:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error("❌ 전송 에러:", error);
      return false;
    }
  }

  /**
   * 큐에 있는 모든 데이터 전송
   */
  async sendAllQueuedData() {
    if (this.dataQueue.length === 0) {
      console.log("📭 전송할 데이터가 없습니다");
      return;
    }

    console.log(`📤 ${this.dataQueue.length}개 데이터 전송 시작`);
    
    // 큐 복사 후 초기화
    const dataToSend = [...this.dataQueue];
    this.dataQueue = [];

    // 각 데이터 개별 전송
    for (const data of dataToSend) {
      const success = await this.sendData(data);
      if (!success) {
        // 실패한 데이터는 다시 큐에 추가
        this.dataQueue.push(data);
      }
    }

    if (this.dataQueue.length > 0) {
      console.log(`⚠️ ${this.dataQueue.length}개 데이터 전송 실패 - 큐에 보관`);
    } else {
      console.log("✅ 모든 데이터 전송 완료");
    }
  }

  /**
   * 즉시 전송 (큐 거치지 않고)
   */
  async sendImmediately(data) {
    return await this.sendData(data);
  }

  /**
   * 서버 연결 테스트
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      if (response.ok) {
        console.log("✅ 서버 연결 정상");
        return true;
      }
    } catch (error) {
      console.log("❌ 서버 연결 실패:", error);
    }
    return false;
  }
}