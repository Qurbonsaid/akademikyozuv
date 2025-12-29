'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  topicsCount: number;
  questionsCount: number;
  submissionsCount: number;
  recentSubmissions: {
    _id: string;
    fullName: string;
    group: string;
    totalScore: number;
    maxScore: number;
    date: string;
    mavzuId: {
      title: string;
    };
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Boshqaruv paneli</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats?.topicsCount || 0}</div>
              <div className="text-gray-500">Mavzular</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ❓
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats?.questionsCount || 0}</div>
              <div className="text-gray-500">Savollar</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats?.submissionsCount || 0}</div>
              <div className="text-gray-500">Javoblar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">So'nggi javoblar</h2>
        </div>
        
        {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
          <ul className="divide-y">
            {stats.recentSubmissions.map((submission) => (
              <li 
                key={submission._id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/javoblar/${submission._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {submission.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{submission.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {submission.group} • {submission.mavzuId?.title}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {submission.totalScore}/{submission.maxScore}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(submission.date)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Hozircha javoblar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
