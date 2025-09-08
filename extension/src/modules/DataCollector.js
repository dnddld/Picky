/**
 * DataCollector.js
 * 
 * 브라우징 데이터 수집기
 * - 체류시간 (timeSpent)
 * - 스크롤깊이 (scrollDepth) 
 * - 활성상태 (isActive)
 */

export class DataCollector {
  constructor() {
    // 초기값 설정
    this.startTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.isActive = true;
    
    console.log("📊 DataCollector 시작:", window.location.href);
    
    // 이벤트 리스너 등록
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 스크롤 추적
    window.addEventListener("scroll", () => {
      this.updateScrollDepth();
    });

    // 활성 상태 추적
    window.addEventListener("focus", () => {
      this.isActive = true;
    });

    window.addEventListener("blur", () => {
      this.isActive = false;
    });

    // 페이지 떠날 때 최종 데이터 수집
    window.addEventListener("beforeunload", () => {
      this.collectData();
    });
  }

  /**
   * 스크롤 깊이 계산 및 업데이트
   */
  updateScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 현재 스크롤 비율 계산 (0-100%)
    this.scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
    
    // 최대 스크롤 깊이 업데이트
    this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
  }

  /**
   * 현재까지의 체류시간 계산 (초)
   */
  getTimeSpent() {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  /**
   * 수집된 데이터 반환
   */
  collectData() {
    const data = {
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title,
      timestamp: new Date().toISOString(),
      
      // 핵심 수집 데이터
      timeSpent: this.getTimeSpent(),        // 체류시간 (초)
      maxScrollDepth: this.maxScrollDepth,   // 최대 스크롤 깊이 (%)
      isActive: this.isActive                // 현재 활성 상태
    };

    console.log("📊 수집된 데이터:", data);
    return data;
  }

}