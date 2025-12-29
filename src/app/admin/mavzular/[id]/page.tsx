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

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'text' | 'choice'>('choice');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Form state
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [topicRes, questionsRes] = await Promise.all([
        fetch(`/api/topics/${topicId}`),
        fetch(`/api/questions?mavzuId=${topicId}`)
      ]);
      
      const topicData = await topicRes.json();
      const questionsData = await questionsRes.json();
      
      setTopic(topicData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const handleOpenModal = (type: 'text' | 'choice', question?: Question) => {
    setModalType(type);
    if (question) {
      setEditingQuestion(question);
      setQuestionText(question.question);
      if (question.type === 'text') {
        setCorrectAnswer(question.correctAnswer || '');
      } else {
        setOptions(question.options || ['', '', '', '']);
        setCorrectIndex(question.correctIndex || 0);
      }
    } else {
      setEditingQuestion(null);
      setQuestionText('');
      setCorrectAnswer('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setQuestionText('');
    setCorrectAnswer('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  };

  const handleSave = async () => {
    if (!questionText.trim()) return;
    if (modalType === 'text' && !correctAnswer.trim()) return;
    if (modalType === 'choice' && options.some(o => !o.trim())) return;

    setSaving(true);

    const questionData = {
      mavzuId: topicId,
      type: modalType,
      question: questionText,
      ...(modalType === 'text' 
        ? { correctAnswer }
        : { options, correctIndex }
      ),
    };

    try {
      if (editingQuestion) {
        await fetch(`/api/questions/${editingQuestion._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        });
      } else {
        await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        });
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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

  if (!topic) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Mavzu topilmadi</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/mavzular')}
          className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-2"
        >
          ← Orqaga
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
            <p className="text-gray-500 mt-1">Kod: {topic.code}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal('text')}
              className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              + Matnli savol
            </button>
            <button
              onClick={() => handleOpenModal('choice')}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Tanlovli savol
            </button>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">#</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-32">Turi</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Savol</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 w-48">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {questions.map((question, index) => (
              <tr key={question._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    question.type === 'text' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {question.type === 'text' ? 'Matnli' : 'Tanlovli'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-800">
                  {question.question.length > 80 
                    ? question.question.substring(0, 80) + '...' 
                    : question.question
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(question.type, question)}
                      className="text-primary hover:bg-primary-light px-3 py-1 rounded transition-colors"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(question._id)}
                      className="text-error hover:bg-error-light px-3 py-1 rounded transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {questions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Hozircha savollar yo'q
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4 my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {modalType === 'text' ? 'Matnli savol' : 'Tanlovli savol'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Savol matni
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Savolni yozing..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                />
              </div>

              {modalType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To'g'ri javob
                  </label>
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="To'g'ri javobni kiriting"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              ) : (
                <>
                  {['A', 'B', 'C', 'D'].map((letter, index) => (
                    <div key={letter}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {letter} variant
                      </label>
                      <input
                        type="text"
                        value={options[index]}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`${letter} variantni kiriting`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To'g'ri javob
                    </label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((letter, index) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setCorrectIndex(index)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            correctIndex === index
                              ? 'bg-success text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              O'chirishni tasdiqlang
            </h2>
            <p className="text-gray-600 mb-6">
              Bu savolni o'chirishni xohlaysizmi?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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
