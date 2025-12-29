'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Topic {
  _id: string;
  code: string;
  title: string;
}

interface Question {
  _id: string;
  type: 'text' | 'choice';
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  order: number;
}

interface Answer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const topicCode = params.topicCode as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Registration state
  const [step, setStep] = useState<'register' | 'quiz'>('register');
  const [fullName, setFullName] = useState('');
  const [group, setGroup] = useState('');

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicRes = await fetch(`/api/topics?code=${topicCode}`);
        if (!topicRes.ok) {
          setError('Mavzu topilmadi');
          return;
        }
        const topicData = await topicRes.json();
        setTopic(topicData);

        const questionsRes = await fetch(`/api/questions?mavzuId=${topicData._id}`);
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);
      } catch (err) {
        setError('Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicCode]);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && group.trim()) {
      setStep('quiz');
    }
  };

  const handleSelectAnswer = (answer: string | number) => {
    setCurrentAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (currentAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    if (currentQuestion.type === 'choice') {
      isCorrect = currentAnswer === currentQuestion.correctIndex;
    } else {
      isCorrect = 
        String(currentAnswer).trim().toLowerCase() === 
        String(currentQuestion.correctAnswer).trim().toLowerCase();
    }

    const newAnswer: Answer = {
      questionId: currentQuestion._id,
      answer: currentAnswer,
      isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed - submit results
      setSubmitting(true);
      
      const correctCount = updatedAnswers.filter(a => a.isCorrect).length;
      const totalScore = correctCount * 10;
      const maxScore = questions.length * 10;

      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mavzuId: topic?._id,
            fullName,
            group,
            totalScore,
            maxScore,
            answers: updatedAnswers,
          }),
        });

        if (res.ok) {
          const submission = await res.json();
          router.push(`/natija/${submission._id}`);
        } else {
          setError('Natijalarni saqlashda xatolik');
        }
      } catch (err) {
        setError('Xatolik yuz berdi');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-error text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </main>
    );
  }

  if (step === 'register') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {topic?.title}
              </h1>
              <p className="text-sm text-gray-500">Kod: {topic?.code}</p>
            </div>

            <form onSubmit={handleStartQuiz}>
              <div className="mb-4">
                <label 
                  htmlFor="fullName" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ism Familiya
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jasur Abdullayev"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="mb-6">
                <label 
                  htmlFor="group" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Guruh
                </label>
                <input
                  type="text"
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="FI-21"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!fullName.trim() || !group.trim()}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Boshlash
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                {questions.length} ta savol • ~{Math.ceil(questions.length * 0.5)} daqiqa
              </p>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Quiz step
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Savol {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      currentAnswer === index
                        ? 'border-primary bg-primary-light'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-semibold ${
                      currentAnswer === index
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-700">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={currentAnswer as string || ''}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Javobingizni yozing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            )}
          </div>

          {/* Navigation */}
          <button
            onClick={handleNextQuestion}
            disabled={currentAnswer === null || currentAnswer === '' || submitting}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saqlanmoqda...' : isLastQuestion ? 'Yakunlash' : 'Keyingi'}
          </button>
        </div>
      </div>
    </main>
  );
}
