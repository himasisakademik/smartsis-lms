import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Code2,
  GraduationCap,
  Layers,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { FEATURED_COURSES_QUERY, STATS_QUERY } from "@/sanity/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Logo } from "@/components/Logo";

export default async function Home() {
  const [{ data: courses }, { data: stats }, user] = await Promise.all([
    sanityFetch({ query: FEATURED_COURSES_QUERY }),
    sanityFetch({ query: STATS_QUERY }),
    currentUser(),
  ]);

  const isSignedIn = !!user;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      <Header />

      <main>
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(30,58,95,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(30,58,95,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none" />

          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/8 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8 backdrop-blur-md animate-fade-in opacity-0">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                  Himpunan Mahasiswa Sistem Informasi
                </span>
              </div>

              <h1 className="text-5xl md:text-9xl font-bold tracking-tighter mb-6 animate-fade-in opacity-0 [animation-delay:200ms] text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-400">
                SMARTSIS
              </h1>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-8 animate-fade-in opacity-0 [animation-delay:300ms] text-slate-500">
                Smart Learning System for HIMASIS Students
              </h2>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in opacity-0 [animation-delay:400ms]">
                Platform pembelajaran eksklusif untuk{" "}
                <span className="text-slate-700 font-medium">
                  Mahasiswa Sistem Informasi
                </span>{" "}
                dari <span className="text-slate-700 font-medium">Himasis</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in opacity-0 [animation-delay:600ms]">
                <Link href={isSignedIn ? "/dashboard" : "/dashboard"}>
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 border-0 h-12 px-8 rounded-full text-base font-semibold tracking-tight transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    {isSignedIn ? "Akses Dashboard" : "Mulai Belajar"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#courses">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-slate-500 hover:text-slate-900 h-12 px-8 rounded-full text-base font-medium"
                  >
                    Lihat Kurikulum
                  </Button>
                </Link>
              </div>

              <ScrollReveal direction="up" delay={500} className="mt-20 w-full max-w-3xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      {stats?.courseCount ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Kursus
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      {stats?.lessonCount ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Pelajaran
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                      {stats?.studentCount ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Mahasiswa Terdaftar
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      100%
                    </div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Gratis & Bersertifikat
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="py-32 relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <ScrollReveal direction="left" className="max-w-2xl mb-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Kenapa belajar di{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                  SMARTSIS
                </span>
                ?
              </h2>
              <p className="text-lg text-slate-500">
                Platform yang dirancang khusus untuk mendukung perjalanan
                akademik mahasiswa Sistem Informasi Himasis.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScrollReveal direction="left" delay={100} className="md:col-span-2">
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 h-full min-h-[280px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                        <Layers className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Kurikulum Terstruktur
                      </h3>
                      <p className="text-slate-500 max-w-md leading-relaxed">
                        Materi disusun secara sistematis dari dasar hingga lanjut.
                        Setiap kursus terbagi dalam modul dan pelajaran yang mudah
                        diikuti langkah demi langkah.
                      </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-slate-500">
                        Langkah demi Langkah
                      </div>
                      <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-slate-500">
                        Video Pembelajaran
                      </div>
                      <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-slate-500">
                        Materi Tertulis
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={200}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 h-full min-h-[280px] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-bl from-emerald-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 border border-emerald-100">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Akses Gratis Selamanya
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      Seluruh materi tersedia tanpa biaya. Cukup daftar dan mulai
                      belajar — tanpa batasan waktu dan tanpa biaya tersembunyi.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={100}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 h-full min-h-[280px] hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-6 border border-amber-100">
                      <Zap className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Lacak Progresmu
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      Pantau kemajuan belajar lewat dashboard pribadi. Lihat
                      kursus yang sedang diambil, pelajaran yang selesai, dan jam
                      belajar yang sudah terakumulasi.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={200} className="md:col-span-2">
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 h-full min-h-[280px] hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tl from-sky-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between h-full gap-6">
                    <div className="max-w-md">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-6 border border-sky-100">
                        <Trophy className="w-6 h-6 text-sky-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Sertifikat Pembelajaran
                      </h3>
                      <p className="text-slate-500 leading-relaxed">
                        Selesaikan seluruh modul kursus dan dapatkan sertifikat
                        digital sebagai bukti kompetensi. Tampilkan di CV dan
                        profil profesionalmu.
                      </p>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <div className="relative w-28 h-28">
                        <svg
                          className="w-28 h-28 -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(30,58,95,0.08)"
                            strokeWidth="8"
                          />

                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />

                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop
                                offset="0%"
                                style={{ stopColor: "#2563eb" }}
                              />

                              <stop
                                offset="100%"
                                style={{ stopColor: "#0ea5e9" }}
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-900">
                            100%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section
          id="courses"
          className="py-32 bg-slate-50 border-t border-slate-200"
        >
          <div className="container mx-auto px-6 max-w-6xl">
            <ScrollReveal direction="up" className="flex items-end justify-between mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
                  Modul Pembelajaran
                </h2>
                <p className="text-slate-500">
                  Pilih modul untuk memulai pembelajaran.
                </p>
              </div>
              <Link href="/dashboard/courses" className="hidden md:block">
                <Button
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Lihat Semua Modul
                </Button>
              </Link>
            </ScrollReveal>

            <div className="space-y-4">
              {courses.map((course: any, index: number) => (
                <ScrollReveal
                  key={course.slug!.current!}
                  direction="up"
                  delay={index * 100}
                >
                  <Link
                    href={`/courses/${course.slug!.current!}`}
                    className="group block"
                  >
                    <div className="relative rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200 hidden sm:block">
                          {course.thumbnail?.asset?.url ? (
                            <img
                              src={course.thumbnail.asset.url}
                              alt=""
                              className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">
                              <Code2 size={20} />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-1 max-w-md">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                            <span>{course.moduleCount ?? 0} Modul</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{course.lessonCount ?? 0} Pelajaran</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <span className="text-sm font-medium mr-2 hidden sm:block">
                          Mulai
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/dashboard/courses">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Lihat Semua Modul
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

          <ScrollReveal direction="up" className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
              Siap untuk{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                berkembang
              </span>
              ?
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Bergabung bersama mahasiswa Sistem Informasi lainnya dan mulai
              perjalanan belajarmu hari ini.
            </p>
            <Link href={isSignedIn ? "/dashboard" : "/dashboard"}>
              <Button
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 h-14 px-10 rounded-full text-base font-semibold tracking-tight transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]"
              >
                {isSignedIn ? "Lanjutkan Belajar" : "Daftar Sekarang — Gratis"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </ScrollReveal>
        </section>

        <footer className="py-20 border-t border-slate-200 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Logo size={28} showText={false} />
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    SMARTSIS | Himasis
                  </span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  Smart Learning System for HIMASIS Students.
                  <br />
                  Himpunan Mahasiswa Sistem Informasi.
                  <br />
                  Membangun masa depan teknologi bersama Himasis.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-6">Platform</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#courses"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Kurikulum
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Himasis
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>&copy; 2026 Himasis. All rights reserved.</p>
              <div className="flex gap-4">
                <span>Instagram</span>
                <span>LinkedIn</span>
                <span>Website</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
