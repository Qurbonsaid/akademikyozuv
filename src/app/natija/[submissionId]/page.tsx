"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Home, CheckCircle, User, Users, AlertCircle } from "lucide-react";

interface Submission {
  _id: string;
  mavzuId: string;
  fullName: string;
  group: string;
  date: string;
  totalScore: number;
  maxScore: number;
  answers: Array<{
    questionId: string;
    answer: number | string;
    isCorrect: boolean;
  }>;
}

interface Topic {
  _id: string;
  title: string;
}

export default function ResultPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;
  const router = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch submission
        const submissionRes = await fetch(`/api/submissions/${submissionId}`);

        if (!submissionRes.ok) {
          setError("Natija topilmadi");
          setIsLoading(false);
          return;
        }

        const submissionData = await submissionRes.json();
        setSubmission(submissionData);

        // Fetch topic
        const topicRes = await fetch(`/api/topics/${submissionData.mavzuId}`);
        if (topicRes.ok) {
          const topicData = await topicRes.json();
          setTopic(topicData);
        }
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchData();
    }
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card-elevated p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground mb-4">{error || "Natija topilmadi"}</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const correctCount = submission.answers.filter((a) => a.isCorrect).length;
  const totalCount = submission.answers.length;
  const percentage = submission.maxScore > 0
    ? Math.round((submission.totalScore / submission.maxScore) * 100)
    : 0;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8 text-center slide-up">
          {/* Trophy Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <Trophy className="w-10 h-10 text-success" />
          </div>

          {/* Congratulations */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Tabriklaymiz!
          </h1>
          <p className="text-muted-foreground mb-6">
            Siz sinovni muvaffaqiyatli yakunladingiz
          </p>

          {/* Student Info */}
          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <User className="w-4 h-4" />
              {submission.fullName}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              {submission.group}
            </span>
          </div>

          {/* Score Display */}
          <div className="bg-success/5 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-success mb-2">
              {submission.totalScore} / {submission.maxScore}
            </div>
            <div className="text-lg text-success/80 font-medium mb-4">
              {percentage}%
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>
                {correctCount} / {totalCount} ta to&apos;g&apos;ri javob
              </span>
            </div>
          </div>

          {/* Topic Info */}
          {topic && (
            <p className="text-sm text-muted-foreground mb-6">
              Mavzu: {topic.title}
            </p>
          )}

          {/* Home Button */}
          <Link
            href="/"
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
