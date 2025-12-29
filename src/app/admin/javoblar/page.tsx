"use client";

import Link from "next/link";
import { Eye, MessageSquare, Search, Filter, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/contexts/DataContext";
import { SuggestionSelect } from "@/components/ui/suggestion-select";

interface Topic {
  _id: string;
  title: string;
}

interface Submission {
  _id: string;
  mavzuId: string;
  fullName: string;
  group: string;
  date: string;
  totalScore: number;
  maxScore: number;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMavzu, setFilterMavzu] = useState<string>("all");
  const [filterScore, setFilterScore] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // Delete state
  const [deletingSubmission, setDeletingSubmission] =
    useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionsRes, topicsRes] = await Promise.all([
          fetch("/api/submissions", { headers: getAuthHeaders() }),
          fetch("/api/topics"),
        ]);

        const submissionsData = await submissionsRes.json();
        const topicsData = await topicsRes.json();

        if (submissionsRes.ok) setSubmissions(submissionsData);
        if (topicsRes.ok) setTopics(topicsData);
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get topic title
  const getTopicTitle = (mavzuId: string) => {
    return topics.find((t) => t._id === mavzuId)?.title || "-";
  };

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesSearch =
        submission.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.group.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMavzu =
        filterMavzu === "all" || submission.mavzuId === filterMavzu;

      const percentage = (submission.totalScore / submission.maxScore) * 100;
      let matchesScore = true;
      if (filterScore === "high") matchesScore = percentage >= 70;
      else if (filterScore === "medium")
        matchesScore = percentage >= 50 && percentage < 70;
      else if (filterScore === "low") matchesScore = percentage < 50;

      return matchesSearch && matchesMavzu && matchesScore;
    });
  }, [submissions, searchQuery, filterMavzu, filterScore]);

  // Delete submission
  const handleDelete = async () => {
    if (!deletingSubmission) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/submissions/${deletingSubmission._id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success("Javob o'chirildi");
        setDeletingSubmission(null);
        setSubmissions((prev) =>
          prev.filter((s) => s._id !== deletingSubmission._id)
        );
      } else {
        const data = await response.json();
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Javoblar</h1>
        <p className="text-muted-foreground">Barcha talabalar javoblari</p>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated mb-6">
        <div className="p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ism yoki guruh bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Mavzu
              </label>
              <SuggestionSelect
                items={topics.map((t) => ({ id: t._id, label: t.title }))}
                value={filterMavzu}
                onChange={setFilterMavzu}
                placeholder="Mavzu qidirish..."
                emptyLabel="Barcha mavzular"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Ball darajasi
              </label>
              <select
                value={filterScore}
                onChange={(e) =>
                  setFilterScore(
                    e.target.value as "all" | "high" | "medium" | "low"
                  )
                }
                className="input-field w-full"
              >
                <option value="all">Barcha natijalar</option>
                <option value="high">Yuqori (70% va undan yuqori)</option>
                <option value="medium">O&apos;rta (50-69%)</option>
                <option value="low">Past (50% dan past)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredSubmissions.length} ta javob topildi
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Ism
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Guruh
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Mavzu
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Ball
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Sana
                </th>
                <th className="text-right px-4 md:px-6 py-4 text-sm font-medium">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => {
                const percentage = Math.round(
                  (submission.totalScore / submission.maxScore) * 100
                );
                return (
                  <tr key={submission._id} className="table-row">
                    <td className="px-4 md:px-6 py-4">
                      <Link
                        href={`/admin/javoblar/${submission._id}`}
                        className="block font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {submission.fullName}
                      </Link>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground">
                      {submission.group}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground">
                      {getTopicTitle(submission.mavzuId)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            percentage >= 70
                              ? "text-success"
                              : percentage >= 50
                              ? "text-foreground"
                              : "text-destructive"
                          }`}
                        >
                          {submission.totalScore}/{submission.maxScore}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({percentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(submission.date)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/javoblar/${submission._id}`}
                          className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeletingSubmission(submission)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {searchQuery || filterMavzu !== "all" || filterScore !== "all"
                ? "Hech qanday javob topilmadi"
                : "Hali javoblar yo'q"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSubmission && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">
              Javobni o&apos;chirish
            </h2>
            <p className="text-muted-foreground mb-4">
              {deletingSubmission.fullName} ning javobini o&apos;chirishni
              xohlaysizmi? Bu amalni ortga qaytarib bo&apos;lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
              <button
                onClick={() => setDeletingSubmission(null)}
                className="btn-ghost flex-1"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
