'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

interface Submission {
  _id: string;
  fullName: string;
  group: string;
  totalScore: number;
  maxScore: number;
  date: string;
  answers: Answer[];
  mavzuId: {
    _id: string;
    title: string;
  };
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        const data = await res.json();
        setSubmission(data.submission);
        setQuestions(data.questions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const handleDelete = async () => {
    try {
      await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
      router.push('/admin/javoblar');
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionById = (id: string) => {
    return questions.find(q => q._id === id);
  };

  const getAnswerDisplay = (answer: Answer, question: Question | undefined) => {
    if (!question) return '-';
    
    if (question.type === 'choice' && question.options) {
      const index = answer.answer as number;
      return `${String.fromCharCode(65 + index)}. ${question.options[index]}`;
    }
    
    return String(answer.answer);
  };

  const getCorrectAnswerDisplay = (question: Question | undefined) => {
    if (!question) return '-';
    
    if (question.type === 'choice' && question.options && question.correctIndex !== undefined) {
      return `${String.fromCharCode(65 + question.correctIndex)}. ${question.options[question.correctIndex]}`;
    }
    
    return question.correctAnswer || '-';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="bg-white rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Javob topilmadi</div>
      </div>
    );
  }

  const percentage = Math.round((submission.totalScore / submission.maxScore) * 100);

  return (
    <div className="p-8">
      {/* Header */}
      <button
        onClick={() => router.push('/admin/javoblar')}
        className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-2"
      >
        ← Orqaga
      </button>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Ism:</div>
            <div className="font-medium text-gray-800">{submission.fullName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Guruh:</div>
            <div className="font-medium text-gray-800">{submission.group}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Mavzu:</div>
            <div className="font-medium text-gray-800">{submission.mavzuId?.title}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Sana:</div>
            <div className="font-medium text-gray-800">{formatDate(submission.date)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Ball:</div>
            <div className={`font-bold text-lg ${
              percentage >= 70 ? 'text-success' : percentage >= 50 ? 'text-yellow-600' : 'text-error'
            }`}>
              {submission.totalScore} / {submission.maxScore} ({percentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Answers Detail */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Javoblar tafsiloti</h2>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">#</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Savol</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Javob</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500 w-24">Natija</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {submission.answers.map((answer, index) => {
              const question = getQuestionById(answer.questionId);
              return (
                <tr key={index} className={answer.isCorrect ? '' : 'bg-error-light/30'}>
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {question?.question || 'Savol topilmadi'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800">
                      {getAnswerDisplay(answer, question)}
                    </div>
                    {!answer.isCorrect && question && (
                      <div className="text-sm text-success mt-1">
                        To'g'ri javob: {getCorrectAnswerDisplay(question)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {answer.isCorrect ? (
                      <span className="text-success text-2xl">✓</span>
                    ) : (
                      <span className="text-error text-2xl">✗</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setDeleteConfirm(true)}
          className="bg-error hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          O'chirish
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              O'chirishni tasdiqlang
            </h2>
            <p className="text-gray-600 mb-6">
              Bu javobni o'chirishni xohlaysizmi?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-error hover:bg-red-600 text-white font-medium px-4 py-3 rounded-lg transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
