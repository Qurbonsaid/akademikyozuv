"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { shuffleArray } from "@/contexts/DataContext";

type QuizStep = "register" | "quiz";

interface Topic {
  _id: string;
  title: string;
  description?: string;
}

interface Question {
  _id: string;
  mavzuId: string;
  type: "choice" | "text";
  question: string;
  options?: string[];
}

interface ShuffledQuestion extends Question {
  shuffledOptions?: string[];
  originalIndices?: number[]; // Maps shuffled index to original index
}

export default function TestPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const router = useRouter();

  const [step, setStep] = useState<QuizStep>("register");
  const [fullName, setFullName] = useState("");
  const [group, setGroup] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number | string>>(
    new Map()
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API data
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch topic and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, questionsRes] = await Promise.all([
          fetch(`/api/topics/${topicId}`),
          fetch(`/api/questions?topicId=${topicId}`),
        ]);

        if (!topicRes.ok) {
          router.push("/");
          return;
        }

        const topicData = await topicRes.json();
        const questionsData = await questionsRes.json();

        setTopic(topicData);

        // Shuffle questions
        const shuffledQuestions = shuffleArray(questionsData as Question[]);

        // For each choice question, shuffle options and track original indices
        const processedQuestions: ShuffledQuestion[] = shuffledQuestions.map(
          (q) => {
            if (q.type === "choice" && q.options) {
              // Create array of indices and shuffle them
              const indices = q.options.map((_, i) => i);
              const shuffledIndices = shuffleArray(indices);

              return {
                ...q,
                shuffledOptions: shuffledIndices.map((i) => q.options![i]),
                originalIndices: shuffledIndices,
              };
            }
            return q;
          }
        );

        setQuestions(processedQuestions);
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    };

    if (topicId) {
      fetchData();
    }
  }, [topicId, router]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && group.trim()) {
      setStep("quiz");
    }
  };

  const handleSelectAnswer = (answer: number | string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = new Map(answers);

    // For choice questions, convert shuffled index to original index
    let answerToStore = selectedAnswer;
    if (
      currentQuestion.type === "choice" &&
      currentQuestion.originalIndices &&
      typeof selectedAnswer === "number"
    ) {
      answerToStore = currentQuestion.originalIndices[selectedAnswer];
    }

    newAnswers.set(currentQuestion._id, answerToStore);
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Submit to API
      setIsSubmitting(true);
      setError(null);

      try {
        const submissionAnswers = questions.map((q) => {
          let answer = newAnswers.get(q._id);

          // Make sure we have the original index for choice questions
          if (
            q.type === "choice" &&
            q.originalIndices &&
            typeof answer === "number"
          ) {
            // Already converted above, but ensure consistency
          }

          return {
            questionId: q._id,
            answer: answer,
          };
        });

        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mavzuId: topicId,
            fullName: fullName.trim(),
            group: group.trim(),
            answers: submissionAnswers,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          router.push(`/natija/${data.submission._id}`);
        } else {
          setError(data.error || "Javoblarni yuborishda xatolik yuz berdi");
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error("Submission error:", err);
        setError("Tarmoq xatosi yuz berdi");
        setIsSubmitting(false);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  // Error state
  if (error && step === "register") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card-elevated p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card-elevated p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-4">
            Bu mavzu uchun savollar topilmadi
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // Registration Step
  if (step === "register") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-elevated p-8 slide-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-primary mb-4">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {topic.title}
              </h1>
              {topic.description && (
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              )}
            </div>

            <form onSubmit={handleStartQuiz} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Ism Familiya
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Misol: Jasur Abdullayev"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="group"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Guruh
                </label>
                <input
                  type="text"
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Misol: FI-21"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!fullName.trim() || !group.trim()}
                className="btn-primary w-full"
              >
                Boshlash
              </button>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {questions.length} ta savol
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />~
                  {Math.ceil(questions.length * 0.5)} daqiqa
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Step
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card-elevated p-6 md:p-8 slide-up">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Savol {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
              {currentQuestion?.question}
            </h2>
          </div>

          {/* Options for Choice Questions - Use shuffled options */}
          {currentQuestion?.type === "choice" &&
            currentQuestion.shuffledOptions && (
              <div className="space-y-3 mb-8">
                {currentQuestion.shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`option-button flex items-start gap-3 ${
                      selectedAnswer === index ? "selected" : ""
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-left">{option}</span>
                    {selectedAnswer === index && (
                      <Check className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

          {/* Text Input for Text Questions */}
          {currentQuestion?.type === "text" && (
            <div className="mb-8">
              <input
                type="text"
                value={(selectedAnswer as string) || ""}
                onChange={(e) => handleSelectAnswer(e.target.value)}
                placeholder="Javobingizni yozing..."
                className="input-field"
                autoComplete="off"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNextQuestion}
            disabled={
              isSubmitting ||
              selectedAnswer === null ||
              (typeof selectedAnswer === "string" && !selectedAnswer.trim())
            }
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? "Yuklanmoqda..."
              : isLastQuestion
              ? "Yakunlash"
              : "Keyingi"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
