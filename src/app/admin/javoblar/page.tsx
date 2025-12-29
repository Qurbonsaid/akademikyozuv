'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  _id: string;
  fullName: string;
  group: string;
  totalScore: number;
  maxScore: number;
  date: string;
  mavzuId: {
    _id: string;
    title: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        const data = await res.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

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
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Javoblar</h1>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Ism</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Guruh</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Mavzu</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Ball</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Sana</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {submissions.map((submission) => (
              <tr 
                key={submission._id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/javoblar/${submission._id}`)}
              >
                <td className="px-6 py-4 font-medium text-gray-800">{submission.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{submission.group}</td>
                <td className="px-6 py-4 text-gray-600">{submission.mavzuId?.title}</td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${
                    submission.totalScore >= submission.maxScore * 0.7 
                      ? 'text-success' 
                      : submission.totalScore >= submission.maxScore * 0.5 
                        ? 'text-yellow-600' 
                        : 'text-error'
                  }`}>
                    {submission.totalScore}/{submission.maxScore}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{formatDate(submission.date)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/admin/javoblar/${submission._id}`)}
                      className="text-primary hover:bg-primary-light px-3 py-1 rounded transition-colors"
                    >
                      Ko'rish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Hozircha javoblar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
