"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, Trash2, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface Topic {
  _id: string;
  title: string;
  createdAt: string;
}

export default function MavzularPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({ title: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch topics
  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTopics(data);
      } else {
        toast.error(data.error || "Mavzularni yuklashda xatolik");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Filter topics
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    return topics.filter((topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  // Open modal for creating
  const openCreateModal = () => {
    setEditingTopic(null);
    setFormData({ title: "" });
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({ title: topic.title });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setFormData({ title: "" });
  };

  // Save topic (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Sarlavhani kiriting");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingTopic
        ? `/api/topics/${editingTopic._id}`
        : "/api/topics";
      const method = editingTopic ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingTopic ? "Mavzu yangilandi" : "Mavzu yaratildi");
        closeModal();
        fetchTopics();
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete topic
  const handleDelete = async () => {
    if (!deletingTopic) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/topics/${deletingTopic._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Mavzu o'chirildi");
        setDeletingTopic(null);
        fetchTopics();
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mavzular</h1>
          <p className="text-muted-foreground">Test mavzularini boshqarish</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi mavzu
        </button>
      </div>

      {/* Search */}
      <div className="card-elevated mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Mavzularni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {filteredTopics.length} ta mavzu topildi
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="card-elevated">
        {filteredTopics.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {searchQuery
                ? "Hech qanday mavzu topilmadi"
                : "Hali mavzular yo'q"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                    Sarlavha
                  </th>
                  <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                    Yaratilgan
                  </th>
                  <th className="text-right px-4 md:px-6 py-4 text-sm font-medium">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => (
                  <tr key={topic._id} className="table-row">
                    <td className="px-4 md:px-6 py-4 font-medium text-foreground">
                      {topic.title}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(topic.createdAt)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(topic)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTopic(topic)}
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingTopic ? "Mavzuni tahrirlash" : "Yangi mavzu"}
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
                  Sarlavha
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Mavzu sarlavhasi"
                  required
                />
              </div>
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
      {deletingTopic && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">
              Mavzuni o&apos;chirish
            </h2>
            <p className="text-muted-foreground mb-4">
              &ldquo;{deletingTopic.title}&rdquo; mavzusini o&apos;chirishni
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
                onClick={() => setDeletingTopic(null)}
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
