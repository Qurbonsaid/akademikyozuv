'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Topic {
  _id: string;
  code: string;
  title: string;
  createdAt: string;
  questionsCount?: number;
}

interface TopicWithCount extends Topic {
  questionsCount: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const topicsData = await res.json();
      
      // Get question counts for each topic
      const topicsWithCounts = await Promise.all(
        topicsData.map(async (topic: Topic) => {
          const questionsRes = await fetch(`/api/questions?mavzuId=${topic._id}`);
          const questions = await questionsRes.json();
          return { ...topic, questionsCount: questions.length };
        })
      );
      
      setTopics(topicsWithCounts);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleOpenModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTitle(topic.title);
    } else {
      setEditingTopic(null);
      setTitle('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setTitle('');
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (editingTopic) {
        await fetch(`/api/topics/${editingTopic._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
      } else {
        await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
      }
      handleCloseModal();
      fetchTopics();
    } catch (error) {
      console.error('Failed to save topic:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchTopics();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mavzular</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Yangi mavzu
        </button>
      </div>

      {/* Topics Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Raqam</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Nomi</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Savollar</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topics.map((topic) => (
              <tr 
                key={topic._id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/mavzular/${topic._id}`)}
              >
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-700 font-mono px-3 py-1 rounded">
                    {topic.code}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{topic.title}</td>
                <td className="px-6 py-4 text-gray-600">{topic.questionsCount} ta</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenModal(topic)}
                      className="text-primary hover:bg-primary-light px-3 py-1 rounded transition-colors"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(topic._id)}
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

        {topics.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Hozircha mavzular yo'q
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingTopic ? 'Mavzuni tahrirlash' : 'Yangi mavzu'}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mavzu nomi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dissertatsiya va ilmiy ish"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            {editingTopic && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raqam
                </label>
                <input
                  type="text"
                  value={editingTopic.code}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || saving}
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
              Bu mavzu va unga tegishli barcha savollar o'chiriladi. Davom etasizmi?
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
