"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Shield,
  GraduationCap,
  FileText,
  CheckCircle,
  Users,
} from "lucide-react";

interface Topic {
  _id: string;
  code: string;
  title: string;
}

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/topics?code=${code}`);
      if (res.ok) {
        router.push(`/test/${code}`);
      } else {
        setError("Mavzu topilmadi");
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicCode: string) => {
    router.push(`/test/${topicCode}`);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800">Imlo sinovlari</span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Kirish
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Akademik yozuv virtual laboratoriyasi
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Imlo va akademik yozuv ko&apos;nikmalaringizni interaktiv testlar
            orqali rivojlantiring
          </p>

          {/* Topics List */}
          {loadingTopics ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">Mavzular yuklanmoqda...</span>
              </div>
            </div>
          ) : topics.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Mavzuni tanlang
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {topics.map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() => handleTopicClick(topic.code)}
                    className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl hover:scale-[1.02] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-500">Kod: {topic.code}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Divider */}
              <div className="flex items-center justify-center my-8">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">yoki</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </div>
          ) : null}

          {/* Topic Code Entry */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-lg mx-auto animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {topics.length > 0 ? "Kod bilan kirish" : "Testni boshlash"}
            </h2>
            <p className="text-gray-500 mb-6">
              O&apos;qituvchi bergan 6 xonali mavzu raqamini kiriting
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="847291"
                  className="w-full px-4 py-5 md:py-6 text-3xl md:text-4xl text-center tracking-[0.3em] font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                  autoComplete="off"
                />
                {error && (
                  <p className="mt-3 text-sm text-red-500 animate-fade-in">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={code.length !== 6 || loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-500/25"
              >
                {loading ? "Yuklanmoqda..." : "Testni boshlash"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
            Platforma imkoniyatlari
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-[1.02] transition-transform"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-sm text-gray-500">
          © 2025 Akademik yozuv virtual laboratoriyasi
        </p>
      </footer>
    </div>
  );
}
