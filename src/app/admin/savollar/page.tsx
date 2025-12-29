"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Edit, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/contexts/DataContext";
import { SuggestionSelect } from "@/components/ui/suggestion-select";

interface Topic {
  _id: string;
  title: string;
}

interface Question {
  _id: string;
  mavzuId: string;
  type: "choice" | "text";
  order: number;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

export default function SavollarPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "choice" | "text">(
    "all"
  );
  const [filterMavzu, setFilterMavzu] = useState<string>("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    mavzuId: "",
    type: "choice" as "choice" | "text",
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    correctAnswer: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, topicsRes] = await Promise.all([
          fetch("/api/questions", { headers: getAuthHeaders() }),
          fetch("/api/topics"),
        ]);

        const questionsData = await questionsRes.json();
        const topicsData = await topicsRes.json();

        if (questionsRes.ok) setQuestions(questionsData);
        if (topicsRes.ok) setTopics(topicsData);
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((savol) => {
      const matchesSearch = savol.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || savol.type === filterType;
      const matchesMavzu =
        filterMavzu === "all" || savol.mavzuId === filterMavzu;
      return matchesSearch && matchesType && matchesMavzu;
    });
  }, [questions, searchQuery, filterType, filterMavzu]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterMavzu]);

  // Get statistics
  const stats = {
    total: questions.length,
    choice: questions.filter((s) => s.type === "choice").length,
    text: questions.filter((s) => s.type === "text").length,
  };

  // Get topic title by ID
  const getTopicTitle = (mavzuId: string) => {
    return topics.find((t) => t._id === mavzuId)?.title || "Noma'lum";
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      mavzuId: topics[0]?._id || "",
      type: "choice",
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      correctAnswer: "",
    });
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      mavzuId: question.mavzuId,
      type: question.type,
      question: question.question,
      options: question.options || ["", "", "", ""],
      correctIndex: question.correctIndex ?? 0,
      correctAnswer: question.correctAnswer || "",
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  // Save question
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error("Savolni kiriting");
      return;
    }

    if (formData.type === "choice") {
      const validOptions = formData.options.filter((o) => o.trim());
      if (validOptions.length < 2) {
        toast.error("Kamida 2 ta variant kiriting");
        return;
      }
    } else if (!formData.correctAnswer.trim()) {
      toast.error("To'g'ri javobni kiriting");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingQuestion
        ? `/api/questions/${editingQuestion._id}`
        : "/api/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        mavzuId: formData.mavzuId,
        type: formData.type,
        question: formData.question,
        order:
          editingQuestion?.order ||
          questions.filter((q) => q.mavzuId === formData.mavzuId).length + 1,
      };

      if (formData.type === "choice") {
        body.options = formData.options.filter((o) => o.trim());
        body.correctIndex = formData.correctIndex;
      } else {
        body.correctAnswer = formData.correctAnswer;
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingQuestion ? "Savol yangilandi" : "Savol yaratildi");
        closeModal();
        // Refresh questions
        const res = await fetch("/api/questions", {
          headers: getAuthHeaders(),
        });
        if (res.ok) setQuestions(await res.json());
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete question
  const handleDelete = async () => {
    if (!deletingQuestion) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/questions/${deletingQuestion._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success("Savol o'chirildi");
        setDeletingQuestion(null);
        setQuestions((prev) =>
          prev.filter((q) => q._id !== deletingQuestion._id)
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Savollar</h1>
        <p className="text-muted-foreground">
          Barcha savollarni boshqarish va tahrirlash
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-sm text-muted-foreground mb-1">
            Jami savollar
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.total}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-muted-foreground mb-1">
            Tanlov savollari
          </div>
          <div className="text-2xl font-bold text-primary">{stats.choice}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-muted-foreground mb-1">
            Matnli savollar
          </div>
          <div className="text-2xl font-bold text-success">{stats.text}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated mb-6">
        <div className="p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Savollarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Savol turi
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | "choice" | "text")
                }
                className="input-field w-full"
              >
                <option value="all">Barcha turlar</option>
                <option value="choice">Tanlov</option>
                <option value="text">Matnli</option>
              </select>
            </div>

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
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredQuestions.length} ta savol topildi
            {filteredQuestions.length > 0 && (
              <span>
                {" "}
                - {startIndex + 1}-
                {Math.min(endIndex, filteredQuestions.length)} ko'rsatilmoqda
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="card-elevated">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Savollar ro&apos;yxati
          </h2>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yangi savol
          </button>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery || filterType !== "all" || filterMavzu !== "all"
              ? "Hech qanday savol topilmadi"
              : "Hali savollar yo'q"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Savol
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mavzu
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tur
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedQuestions.map((savol, index) => (
                  <tr key={savol._id} className="table-row">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground max-w-md">
                      <div className="line-clamp-2">{savol.question}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {getTopicTitle(savol.mavzuId)}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          savol.type === "choice"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {savol.type === "choice" ? "Tanlov" : "Matnli"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(savol)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingQuestion(savol)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredQuestions.length > itemsPerPage && (
          <div className="flex items-center justify-between p-4 md:p-6 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Sahifa {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                ← Oldingi
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Keyingi →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mavzu
                </label>
                <select
                  value={formData.mavzuId}
                  onChange={(e) =>
                    setFormData({ ...formData, mavzuId: e.target.value })
                  }
                  className="input-field w-full"
                  required
                >
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Savol turi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "choice" | "text",
                    })
                  }
                  className="input-field w-full"
                >
                  <option value="choice">Tanlov</option>
                  <option value="text">Matnli</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Savol matni
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="input-field w-full min-h-[100px]"
                  placeholder="Savolni kiriting..."
                  required
                />
              </div>

              {formData.type === "choice" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Variantlar
                  </label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={formData.correctIndex === index}
                        onChange={() =>
                          setFormData({ ...formData, correctIndex: index })
                        }
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="input-field flex-1"
                        placeholder={`Variant ${index + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-1">
                    To&apos;g&apos;ri javobni tanlang (radio tugmasi)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    To&apos;g&apos;ri javob
                  </label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="To'g'ri javobni kiriting"
                    required={formData.type === "text"}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-1"
                >
                  {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-ghost flex-1"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuestion && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">
              Savolni o&apos;chirish
            </h2>
            <p className="text-muted-foreground mb-4">
              Bu savolni o&apos;chirishni xohlaysizmi? Bu amalni ortga qaytarib
              bo&apos;lmaydi.
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
                onClick={() => setDeletingQuestion(null)}
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
