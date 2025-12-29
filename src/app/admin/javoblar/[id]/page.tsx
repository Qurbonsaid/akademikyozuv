"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Users,
  FileText,
  Calendar,
  Trophy,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/contexts/DataContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Question {
  _id: string;
  mavzuId: string;
  type: "choice" | "text";
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

interface Answer {
  questionId: string;
  answer: number | string;
  isCorrect: boolean;
}

interface Submission {
  _id: string;
  mavzuId: string;
  fullName: string;
  group: string;
  date: string;
  totalScore: number;
  maxScore: number;
  answers: Answer[];
}

interface Topic {
  _id: string;
  title: string;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch submission
        const submissionRes = await fetch(`/api/submissions/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!submissionRes.ok) {
          toast.error("Javob topilmadi");
          router.push("/admin/javoblar");
          return;
        }

        const submissionData = await submissionRes.json();
        setSubmission(submissionData);

        // Fetch topic and questions in parallel
        const [topicRes, questionsRes] = await Promise.all([
          fetch(`/api/topics/${submissionData.mavzuId}`),
          fetch(`/api/questions?topicId=${submissionData.mavzuId}`, {
            headers: getAuthHeaders(),
          }),
        ]);

        if (topicRes.ok) {
          const topicData = await topicRes.json();
          setTopic(topicData);
        }

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const correctCount =
    submission?.answers.filter((a) => a.isCorrect).length || 0;
  const totalCount = submission?.answers.length || 0;
  const percentage = submission
    ? Math.round((submission.totalScore / submission.maxScore) * 100)
    : 0;

  const getQuestionById = (questionId: string): Question | undefined => {
    return questions.find((q) => q._id === questionId);
  };

  const getAnswerDisplay = (answer: number | string, question?: Question) => {
    if (!question) return String(answer);
    if (question.type === "text") return String(answer);
    if (question.type === "choice" && question.options) {
      const index = Number(answer);
      return `${String.fromCharCode(65 + index)}) ${question.options[index]}`;
    }
    return String(answer);
  };

  const getCorrectAnswerDisplay = (question?: Question) => {
    if (!question) return "";
    if (question.type === "text") return question.correctAnswer || "";
    if (
      question.type === "choice" &&
      question.options &&
      question.correctIndex !== undefined
    ) {
      return `${String.fromCharCode(65 + question.correctIndex)}) ${
        question.options[question.correctIndex]
      }`;
    }
    return "";
  };

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

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success("Javob o'chirildi");
        router.push("/admin/javoblar");
      } else {
        const data = await response.json();
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="max-w-4xl mx-auto fade-in">
      {/* Header */}
      <button
        onClick={() => router.push("/admin/javoblar")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Orqaga
      </button>

      {/* Student Info Card */}
      <div className="card-elevated p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Ism</div>
              <div className="font-medium text-foreground">
                {submission.fullName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Guruh</div>
              <div className="font-medium text-foreground">
                {submission.group}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Mavzu</div>
              <div className="font-medium text-foreground">{topic?.title || "-"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sana</div>
              <div className="font-medium text-foreground">
                {formatDate(submission.date)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 md:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Ball</div>
              <div className="font-medium text-foreground">
                {submission.totalScore} / {submission.maxScore} ({percentage}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {correctCount} / {totalCount} ta to&apos;g&apos;ri javob
          </div>
          <div className="flex gap-1">
            {submission.answers.map((answer, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  answer.isCorrect ? "bg-success" : "bg-destructive"
                }`}
                title={`Savol ${index + 1}: ${
                  answer.isCorrect ? "To'g'ri" : "Noto'g'ri"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Answers Detail */}
      <div className="card-elevated overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Javoblar tafsiloti
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium w-12">
                  #
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Savol
                </th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-medium">
                  Javob
                </th>
                <th className="text-center px-4 md:px-6 py-4 text-sm font-medium w-20">
                  Natija
                </th>
              </tr>
            </thead>
            <tbody>
              {submission.answers.map((answer, index) => {
                const question = getQuestionById(answer.questionId);
                return (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 md:px-6 py-4 text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-foreground">
                      {question?.question || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div
                        className={
                          answer.isCorrect
                            ? "text-foreground"
                            : "text-destructive"
                        }
                      >
                        {getAnswerDisplay(answer.answer, question)}
                      </div>
                      {!answer.isCorrect && (
                        <div className="text-sm text-success mt-1">
                          To&apos;g&apos;ri javob:{" "}
                          {getCorrectAnswerDisplay(question)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex justify-center">
                        {answer.isCorrect ? (
                          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-success" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                            <X className="w-4 h-4 text-destructive" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          O&apos;chirish
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Javobni o&apos;chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham {submission.fullName}ning javobini
              o&apos;chirmoqchimisiz? Bu amalni ortga qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
