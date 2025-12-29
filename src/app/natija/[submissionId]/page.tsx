'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Submission {
  _id: string;
  fullName: string;
  group: string;
  totalScore: number;
  maxScore: number;
  answers: { isCorrect: boolean }[];
  mavzuId: {
    title: string;
  };
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) {
          setError('Natija topilmadi');
          return;
        }
        const data = await res.json();
        setSubmission(data.submission);
      } catch (err) {
        setError('Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

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

  if (error || !submission) {
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

  const correctCount = submission.answers.filter(a => a.isCorrect).length;
  const totalQuestions = submission.answers.length;
  const percentage = Math.round((submission.totalScore / submission.maxScore) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
          {/* Celebration Icon */}
          <div className="text-6xl mb-4">🎉</div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tabriklaymiz!
          </h1>
          
          <p className="text-gray-600 mb-6">
            {submission.fullName} • {submission.group}
          </p>

          {/* Score Display */}
          <div className="bg-success-light rounded-xl p-6 mb-6">
            <div className="text-5xl font-bold text-success mb-2">
              {submission.totalScore} / {submission.maxScore}
            </div>
            <div className="text-lg text-success font-medium">
              ball
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{percentage}%</div>
              <div className="text-sm text-gray-500">Foiz</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">
                {correctCount} / {totalQuestions}
              </div>
              <div className="text-sm text-gray-500">to'g'ri javob</div>
            </div>
          </div>

          {/* Home Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </main>
  );
}
