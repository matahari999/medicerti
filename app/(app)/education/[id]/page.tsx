'use client';

import { mockEducationCourses } from '@/lib/mock-data';
import { EDUCATION_CATEGORY_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Award,
  Clock,
  Users,
  BookOpen,
  Star,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { calcProgressPercent } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EducationDetailPage({ params }: Props) {
  const { id } = use(params);
  const course = mockEducationCourses.find((c) => c.id === id) || mockEducationCourses[0];
  
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function loadProgress() {
      // 1. LocalStorage 우선 로드
      const saved = localStorage.getItem('education_progress');
      let localVal = 0;
      if (saved) {
        const parsed = JSON.parse(saved);
        localVal = parsed[course.id] ?? 0;
        setProgress(localVal);
      }

      // 2. Supabase 연동 시 DB 로드
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');
      if (!isMockMode) {
        try {
          const supabase = createClient();
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            setSession(currentSession);
            const { data: dbProgress, error } = await supabase
              .from('education_progress')
              .select('progress')
              .eq('user_id', currentSession.user.id)
              .eq('course_id', course.id)
              .maybeSingle();

            if (dbProgress) {
              setProgress(dbProgress.progress);
              
              // 로컬스토리지에도 동기화
              const savedParsed = saved ? JSON.parse(saved) : {};
              savedParsed[course.id] = dbProgress.progress;
              localStorage.setItem('education_progress', JSON.stringify(savedParsed));
            }
          }
        } catch (err) {
          console.error('진도율 DB 로드 실패:', err);
        }
      }
      setLoading(false);
    }
    loadProgress();
  }, [course.id]);

  const updateProgress = async (newVal: number) => {
    setProgress(newVal);

    // 1. LocalStorage 업데이트
    const saved = localStorage.getItem('education_progress');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[course.id] = newVal;
    localStorage.setItem('education_progress', JSON.stringify(parsed));

    // 2. DB 업데이트
    if (session) {
      try {
        const supabase = createClient();
        const updateData: any = {
          user_id: session.user.id,
          course_id: course.id,
          progress: newVal,
          updated_at: new Date().toISOString(),
        };
        if (newVal === 100) {
          updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('education_progress')
          .upsert(updateData, { onConflict: 'user_id,course_id' });
          
        if (error) {
          console.error('진도율 DB 업데이트 오류:', error);
        }
      } catch (err) {
        console.error('진도율 DB 업데이트 실패:', err);
      }
    }
  };

  const handleStartLearning = () => {
    setIsPlaying(true);
    setTimeout(() => {
      updateProgress(100);
      setSuccessMsg('교육 학습이 정상 완료되었습니다. 수료증 발급이 가능합니다! 🎉');
      setIsPlaying(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">교육 정보를 로딩하고 있습니다...</p>
      </div>
    );
  }

  const isCompleted = progress === 100;
  
  const chapters = [
    { num: 1, title: '개요 및 목적', duration: 15, done: progress >= 25 },
    { num: 2, title: '핵심 원칙과 기준', duration: 25, done: progress >= 50 },
    { num: 3, title: '실무 적용 사례', duration: 30, done: progress >= 75 },
    { num: 4, title: '자가 평가 및 마무리', duration: 20, done: progress >= 100 },
  ];

  return (
    <div className="max-w-4xl space-y-5 fade-in">
      <Link
        href="/education"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14} />
        교육 목록 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {course.isMandatory && !isCompleted && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 fade-in">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span><strong>법정필수교육</strong>입니다. 기한 내 이수하지 않으면 과태료가 부과될 수 있습니다.</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg shadow-sm font-medium fade-in">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {successMsg}
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="bg-slate-900 aspect-video flex items-center justify-center relative">
              {isPlaying ? (
                <div className="text-white text-center space-y-3 fade-in">
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={36} />
                  <div className="text-sm text-white/70">동영상 강의 재생 중... (2.5초 후 진도 100% 완료 처리됩니다)</div>
                </div>
              ) : (
                <button
                  onClick={handleStartLearning}
                  className="flex flex-col items-center gap-3 text-white hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                    <Play size={28} className="ml-1" />
                  </div>
                  <span className="text-sm font-medium">
                    {progress > 0 && !isCompleted ? '이어 학습하기' : isCompleted ? '처음부터 다시 보기' : '수강 시작하기'}
                  </span>
                </button>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="badge badge-info text-xs">{EDUCATION_CATEGORY_LABELS[course.category] || course.category}</span>
                {course.isMandatory && (
                  <span className="badge badge-urgent text-xs">법정필수</span>
                )}
              </div>
              <h1 className="text-xl font-black text-slate-900 mb-2 leading-snug">{course.title}</h1>
              <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">교육 과정 목차</h3>
            <div className="space-y-3">
              {chapters.map((ch) => (
                <div
                  key={ch.num}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                    ch.done ? 'border-slate-100 bg-slate-50/50' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      ch.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {ch.done ? <CheckCircle2 size={12} /> : ch.num}
                    </div>
                    <span className={`font-semibold ${ch.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {ch.title}
                    </span>
                  </div>
                  <span className="text-slate-400 font-medium">{ch.duration}분</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="card p-4 space-y-3.5">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">교육 상세 정보</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">교육 시간</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  {course.duration}분
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">진도 상태</span>
                <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {progress}% 완료
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500 flex-shrink-0">대상 직무</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                  {course.targetJobTypes ? (
                    course.targetJobTypes.map((job, idx) => (
                      <span key={idx} className="badge badge-default scale-90 origin-right">
                        {job}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">전 직원</span>
                  )}
                </div>
              </div>
            </div>

            {course.hasCertificate && (
              <button
                disabled={!isCompleted}
                onClick={() => alert(`수료증 다운로드 성공! [수료증 번호: CERT-${course.id}-${Math.floor(Math.random()*100000)}]`)}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <Award size={14} />
                수료증 출력하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}