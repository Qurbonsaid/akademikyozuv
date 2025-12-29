"use client";

import Link from "next/link";
import {
  FileText,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  User,
  Trophy,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/contexts/DataContext";

interface RecentSubmission {
  _id: string;
  fullName: string;
  group: string;
  date: string;
  totalScore: number;
  maxScore: number;
  mavzuId: string;
  topicTitle?: string;
}

interface DashboardStats {
  topics: { total: number };
  questions: { total: number; choice: number; text: number };
  submissions: { total: number };
  recentSubmissions: RecentSubmission[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password update state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        } else {
          toast.error(data.error || "Statistikani yuklashda xatolik");
        }
      } catch (error) {
        toast.error("Tarmoq xatosi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Yangi parollar mos kelmaydi");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Parol muvaffaqiyatli yangilandi");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        toast.error(data.error || "Parolni yangilashda xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsUpdating(false);
    }
  };

  const statCards = [
    {
      icon: FileText,
      count: stats?.topics.total ?? 0,
      label: "Mavzular",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: HelpCircle,
      count: stats?.questions.total ?? 0,
      label: "Savollar",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: MessageSquare,
      count: stats?.submissions.total ?? 0,
      label: "Javoblar",
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    },
  ];

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    return `${diffDays} kun oldin`;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Boshqaruv paneli
        </h1>
        <p className="text-muted-foreground">
          Umumiy statistika va so&apos;nggi faoliyat
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {stat.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update Password Section */}
      <div className="card-elevated mb-8">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Parolni yangilash
                </h2>
                <p className="text-sm text-muted-foreground">
                  Hisobingiz xavfsizligini ta&apos;minlash uchun parolni yangilang
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-ghost text-sm"
            >
              {showPasswordForm ? "Yopish" : "Ochish"}
            </button>
          </div>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordUpdate} className="p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Joriy parol
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="input-field w-full"
                placeholder="Joriy parolingizni kiriting"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Yangi parol
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="input-field w-full"
                placeholder="Yangi parolni kiriting (kamida 6 ta belgi)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Yangi parolni tasdiqlang
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="input-field w-full"
                placeholder="Yangi parolni qayta kiriting"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary"
              >
                {isUpdating ? "Yuklanmoqda..." : "Parolni yangilash"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="btn-ghost"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="card-elevated">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            So&apos;nggi javoblar
          </h2>
          <Link
            href="/admin/javoblar"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Barchasini ko&apos;rish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Hali javoblar yo&apos;q
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentSubmissions.map((submission) => (
              <Link
                key={submission._id}
                href={`/admin/javoblar/${submission._id}`}
                className="flex items-center justify-between p-4 md:px-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {submission.fullName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{submission.group}</span>
                      <span>•</span>
                      <span>{submission.topicTitle || "Noma'lum mavzu"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Trophy className="w-4 h-4 text-success" />
                    {submission.totalScore}/{submission.maxScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(submission.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
