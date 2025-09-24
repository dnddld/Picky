import { useState, useEffect } from 'react';
import Box from '../components/Box';
import Badge from '../components/Badge';
import { CheckCircle, XCircle, Trophy, Target, Flame, Bookmark, Loader, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import api from '../lib/api';

const QuizTab = () => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizData, setQuizData] = useState([]); // Initialize with empty array
  const [scrapedQuizIds, setScrapedQuizIds] = useState(new Set());
  const [quizIdToScrapIdMap, setQuizIdToScrapIdMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    correctRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyProgress: []
  });

  useEffect(() => {
    const fetchQuizStats = async () => {
      try {
        const response = await api.get('/api/dashboard/quiz/stats');
        if (response.data && response.data.data) {
          setQuizStats({
            ...response.data.data,
            weeklyProgress: response.data.data.weeklyProgress || []
          });
        }
      } catch (err) {
        console.error("퀴즈 통계를 가져오는 데 실패했습니다.", err);
      }
    };
    fetchQuizStats();
  }, []);

  useEffect(() => {
    const fetchQuizAndScrapStatus = async () => {
      try {
        setLoading(true);
        // Fetch quiz recommendation
        const quizResponse = await api.get('/api/recommendations/next?type=QUIZ');
        const fetchedQuiz = quizResponse.data.data;
        if (fetchedQuiz) {
          setQuizData([fetchedQuiz]); // Assuming it returns one quiz at a time
        } else {
          setQuizData([]);
        }

        // Fetch initial scrap status
        const scrapResponse = await api.get(`/api/scraps?type=QUIZ`);
        if (scrapResponse.data && scrapResponse.data.data && scrapResponse.data.data.content) {
          const initialScrapedIds = new Set();
          const initialQuizIdToScrapIdMap = new Map();
          scrapResponse.data.data.content.forEach(scrap => {
            if (scrap.contentType === 'QUIZ') {
              initialScrapedIds.add(scrap.contentId);
              initialQuizIdToScrapIdMap.set(scrap.contentId, scrap.scrapId);
            }
          });
          setScrapedQuizIds(initialScrapedIds);
          setQuizIdToScrapIdMap(initialQuizIdToScrapIdMap);
        }
      } catch (err) {
        console.error("퀴즈 및 스크랩 상태를 가져오는 데 실패했습니다.", err);
        setError("퀴즈를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndScrapStatus();
  }, []);

  const currentQuiz = quizData[currentQuizIndex];

  const handleAnswer = async (answer) => {
    if (!currentQuiz) {
      console.warn("No current quiz to answer.");
      return;
    }
    setSelectedAnswer(answer);
    setShowExplanation(true);
    try {
      await api.post(`/api/quizzes/${currentQuiz.contentId}/answer`, { userAnswer: answer });
      // Optionally, update quiz stats or provide feedback based on response
    } catch (error) {
      console.error("퀴즈 답변 제출에 실패했습니다.", error);
    }
  };

  const nextQuiz = async () => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Fetch a new quiz from API
      try {
        setLoading(true);
        const quizResponse = await api.get('/api/recommendations/next?type=QUIZ');
        const fetchedQuiz = quizResponse.data.data;
        if (fetchedQuiz) {
          setQuizData([fetchedQuiz]); // Replace with new quiz
          setCurrentQuizIndex(0); // Reset index for the new quiz
        } else {
          setQuizData([]); // No more quizzes available
        }
        setSelectedAnswer(null);
        setShowExplanation(false);
      } catch (err) {
        console.error("다음 퀴즈를 가져오는 데 실패했습니다.", err);
        setError("다음 퀴즈를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleScrapToggle = async (quizId) => {
    try {
      const response = await api.post('/api/scraps/toggle', { contentType: 'QUIZ', contentId: quizId });
      const { message, data } = response.data;

      if (message === "스크랩 저장 성공") { // Assuming backend sends this message for successful save
        setScrapedQuizIds(prev => new Set(prev.add(quizId)));
        setQuizIdToScrapIdMap(prev => new Map(prev.set(quizId, data.scrapId))); // Assuming data contains scrapId
      } else if (message === "스크랩 취소 성공") { // Assuming backend sends this message for successful delete
        setScrapedQuizIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(quizId);
          return newSet;
        });
        setQuizIdToScrapIdMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(quizId);
          return newMap;
        });
      }
    } catch (error) {
      console.error(`스크랩 토글 실패: ${quizId}`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 퀴즈 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Box className="text-center p-4">
          <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-700">{quizStats.totalQuizzes}</p>
          <p className="text-sm text-purple-600">총 참여 퀴즈</p>
        </Box>
        
        <Box className="text-center p-4">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{quizStats.correctRate}%</p>
          <p className="text-sm text-green-600">정답률</p>
        </Box>
        
        <Box className="text-center p-4">
          <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-700">{quizStats.currentStreak}</p>
          <p className="text-sm text-orange-600">연속 정답</p>
        </Box>
        
        <Box className="text-center p-4">
          <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{quizStats.bestStreak}</p>
          <p className="text-sm text-blue-600">최고 연속 정답</p>
        </Box>
      </div>

      {/* 이번 주 퀴즈 진행률 */}
      <Box className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">이번 주 퀴즈 활동</h3>
        <div className="grid grid-cols-7 gap-2">
          {quizStats.weeklyProgress.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-600 mb-2">{day.day}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(day.correct / day.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{day.correct}/{day.total}</p>
            </div>
          ))}
        </div>
      </Box>

      {loading ? (
        <Box className="p-6 text-center text-gray-500">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>퀴즈를 불러오는 중...</p>
        </Box>
      ) : error ? (
        <Box className="p-6 text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>퀴즈를 불러오는 데 실패했습니다.</p>
        </Box>
      ) : currentQuiz ? (
        <Box>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">오늘의 퀴즈</h3>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Badge>{currentQuiz.category}</Badge>
              <Button variant="ghost" size="sm" onClick={() => handleScrapToggle(currentQuiz.contentId)} className={scrapedQuizIds.has(currentQuiz.contentId) ? 'text-yellow-500' : 'text-gray-400'}>
                <Bookmark className={`w-4 h-4 ${scrapedQuizIds.has(currentQuiz.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <span>문제 {currentQuizIndex + 1} / {quizData.length}</span>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuiz.question}</h3>
            {!showExplanation ? (
              <div className="flex justify-center space-x-4">
                <Button onClick={() => handleAnswer(true)} className="w-24 h-24 rounded-full bg-green-100 hover:bg-green-200 text-green-700 text-4xl font-bold">O</Button>
                <Button onClick={() => handleAnswer(false)} className="w-24 h-24 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-4xl font-bold">X</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center justify-center p-4 rounded-lg ${selectedAnswer === currentQuiz.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedAnswer === currentQuiz.answer ? <CheckCircle className="w-6 h-6 mr-2" /> : <XCircle className="w-6 h-6 mr-2" />}
                  <span className="font-semibold">{selectedAnswer === currentQuiz.answer ? '정답입니다!' : '오답입니다.'} (정답: {currentQuiz.answer ? 'O' : 'X'})</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">해설</h4>
                  <p className="text-blue-800">{currentQuiz.explanation}</p>
                </div>
                {currentQuizIndex < quizData.length - 1 && (
                  <div className="text-center">
                    <Button onClick={nextQuiz} variant="primary">다음 문제</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Box>
      ) : (
        <Box className="p-6 text-center text-gray-500">
          <p>표시할 퀴즈가 없습니다.</p>
        </Box>
      )}

      {currentQuizIndex === quizData.length - 1 && showExplanation && (
        <Box className="text-center">
          <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-900 mb-2">오늘의 퀴즈 완료!</h3>
          <p className="text-purple-700 mb-4">수고하셨습니다. 내일도 새로운 퀴즈로 찾아뵙겠습니다.</p>
          <Button variant="primary">내 퀴즈 기록 보기</Button>
        </Box>
      )}
    </div>
  );
}

export default QuizTab;