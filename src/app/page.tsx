"use client";

import Link from "next/link";
import {
  BookOpen,
  Shield,
  GraduationCap,
  FileText,
  CheckCircle,
  Users,
  ArrowRight,
  Clock,
  HelpCircle,
  Search,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface Topic {
  _id: string;
  title: string;
}

interface QuestionCount {
  mavzuId: string;
  count: number;
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Map<string, number>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch topics and question counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, questionsRes] = await Promise.all([
          fetch("/api/topics"),
          fetch("/api/questions"),
        ]);

        const topicsData = await topicsRes.json();
        const questionsData = await questionsRes.json();

        if (topicsRes.ok) setTopics(topicsData);

        // Count questions per topic
        if (questionsRes.ok) {
          const counts = new Map<string, number>();
          questionsData.forEach((q: { mavzuId: string }) => {
            const current = counts.get(q.mavzuId) || 0;
            counts.set(q.mavzuId, current + 1);
          });
          setQuestionCounts(counts);
        }
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter topics by search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;

    return topics.filter((topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  const features = [
    {
      icon: FileText,
      title: "Turli mavzular",
      description:
        "Dissertatsiya, referat, esse va boshqa akademik yozuv turlari",
    },
    {
      icon: CheckCircle,
      title: "Interaktiv testlar",
      description: "Bilimingizni sinab ko'ring va natijalarni darhol oling",
    },
    {
      icon: Users,
      title: "Talabalar uchun",
      description: "Universitet talabalari uchun maxsus ishlab chiqilgan",
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">
              Virtual Laboratoriya
            </span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Kirish
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Akademik yozuv virtual laboratoriyasi
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Imlo va akademik yozuv ko'nikmalaringizni interaktiv testlar orqali
            rivojlantiring
          </p>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Mavzularni tanlang
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            O'zingizga kerakli mavzuni tanlang va sinovni boshlang
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Mavzular bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Hech qanday mavzu topilmadi
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic, index) => {
                const questionCount = questionCounts.get(topic._id) || 0;
                return (
                  <Link
                    key={topic._id}
                    href={`/test/${topic._id}`}
                    className="card-elevated p-6 hover:scale-[1.02] transition-all duration-200 group slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            {questionCount} ta savol
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />~
                            {Math.ceil(questionCount * 0.5)} daqiqa
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Sinovni boshlash
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Platforma imkoniyatlari
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-elevated p-6 text-center hover:scale-[1.02] transition-transform"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 Akademik yozuv virtual laboratoriyasi
        </p>
      </footer>
    </div>
  );
}
