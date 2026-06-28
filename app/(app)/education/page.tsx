'use client';

import { useState, useEffect } from 'react';
import { mockEducationCourses } from '@/lib/mock-data';
import { EDUCATION_CATEGORY_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { EducationCourse, EducationCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Award,
  Filter,
  Search,
  Play,
  Star,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function getCategoryColor(category: EducationCategory): string {
  const colorMap: Record<string, string> = {
    mandatory: 'bg-red-100 text-red-700',
    certification: 'bg-blue-100 text-blue-700',
    infection: 'bg-teal-100 text-teal-700',
    safety: 'bg-amber-100 text-amber-700',
    job_skill: 'bg-purple-100 text-purple-700',
    admin: 'bg-slate-100 text-slate-700',
  };
  return colorMap[category] || colorMap.admin;
}

export default function EducationPage() {
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const savedProgress = localStorage.getItem('education_progress');
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        const initialProgress = {
          'edu-001': 75,
          'edu-002': 100,
          'edu-003': 0,
          'edu-004': 30,
        };
        setProgress(initialProgress);
        localStorage.setItem('education_progress', JSON.stringify(initialProgress));
      }

      setCourses(mockEducationCourses);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

      if (!isMockMode) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*, hospitals(name, type)')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUserProfile(profile);
            }

            // DB에서 해당 유저의 교육 진도율 가져오기
            const { data: dbProgress, error: progressErr } = await supabase
              .from('education_progress')
              .select('course_id, progress')
              .eq('user_id', session.user.id);
            
            if (!progressErr && dbProgress) {
              const dbProgressMap: Record<string, number> = {};
              dbProgress.forEach((item) => {
                dbProgressMap[item.course_id] = item.progress;
              });

              // 기존 progress와 머지
              setProgress((prev) => {
                const merged = { ...prev, ...dbProgressMap };
                localStorage.setItem('education_progress', JSON.stringify(merged));
                return merged;
              });
            }
          }
        } catch (err) {
          console.error('사용자 데이터 로드 실패:', err);
        }
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">교육 코스를 로드하는 중...</p>
      </div>
    );
  }

  const completedCount = Object.values(progress).filter((p) => p === 100).length;
  const inProgressCount = Object.values(progress).filter((p) => p > 0 && p < 100).length;

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" />
            교육 플랫폼
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {userProfile?.hospitals?.name 
              ? `${userProfile.hospitals.name} 직원을 위한 법정필수 교육 및 평가인증 표준 과정입니다.`
              : '의료기관 직원을 위한 법정필수 교육 및 평가인증 표준 과정입니다.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{completedCount}개</div>
            <div className="text-xs text-slate-500 font-medium">이수 완료 교육</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Play size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{inProgressCount}개</div>
            <div className="text-xs text-slate-500 font-medium">진행 중 교육</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">
              {courses.filter(c => c.isMandatory && (progress[c.id] ?? 0) < 100).length}개
            </div>
            <div className="text-xs text-slate-500 font-medium">미이수 법정 필수</div>
          </div>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="교육 코스 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <Search className="absolute left-3 bottom-2.5 text-slate-400" size={14} />
        </div>

        <div className="flex items-center gap-2 md:w-64">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카테고리</option>
            <option value="mandatory">법정필수교육</option>
            <option value="certification">평가인증교육</option>
            <option value="infection">감염관리</option>
            <option value="safety">환자안전</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state card py-12">
          <div className="font-medium text-slate-600">검색 조건에 맞는 교육이 없습니다.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const courseProgress = progress[course.id] ?? 0;
            const isCompleted = courseProgress === 100;

            return (
              <div key={course.id} className="card hover:shadow-md transition-all fade-in">
                <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play size={16} className="text-white ml-0.5" />
                  </div>

                  {isCompleted && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} />
                      완료
                    </div>
                  )}

                  {course.isMandatory && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      <Star size={10} />
                      법정필수
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1.5 bg-white/20">
                      <div
                        className={`h-full transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-blue-400'}`}
                        style={{ width: `${courseProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`badge text-[10px] font-bold ${getCategoryColor(course.category)}`}>
                      {EDUCATION_CATEGORY_LABELS[course.category] || course.category}
                    </span>
                    {course.hasCertificate && (
                      <span className="badge bg-amber-50 text-amber-700 flex items-center gap-0.5 text-[10px]">
                        <Award size={9} />
                        수료증
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 mb-1.5 line-clamp-2 h-10">{course.title}</h3>

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 h-8 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {course.duration}분 과정
                    </span>
                    <span className="font-medium text-slate-600">진도율 {courseProgress}%</span>
                  </div>

                  <Link
                    href={`/education/${course.id}`}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <BookOpen size={12} />
                    <span>{courseProgress > 0 && !isCompleted ? '이어 듣기' : isCompleted ? '다시 학습' : '수강하기'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}