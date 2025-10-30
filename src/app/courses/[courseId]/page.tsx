'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Course = { id: string; title: string; description: string | null };
type Lesson = { id: string; title: string; sort_order: number };

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 코스 정보(공개)
      const { data: c } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(c);

      // 로그인 유저 확인 & 수강여부 확인
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: en } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('course_id', courseId)
          .eq('user_id', userData.user.id)
          .maybeSingle();
        setEnrolled(!!en);
      }

      // 수강한 경우에만 레슨 목록 가져오기 (RLS 정책에 의해)
      if (enrolled) {
        const { data: ls } = await supabase
          .from('lessons')
          .select('id,title,sort_order')
          .eq('course_id', courseId)
          .order('sort_order', { ascending: true });
        if (ls) setLessons(ls);
      }
      setLoading(false);
    })();
  // enrolled 상태 변화를 반영하기 위해 의존성에 포함
  }, [courseId, enrolled]);

  const handleEnroll = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push('/login');
      return;
    }
    const { error } = await supabase.from('enrollments').insert({
      user_id: userData.user.id,
      course_id: String(courseId),
    });
    if (!error) setEnrolled(true);
  };

  if (loading) return <main style={{ padding: 24 }}>불러오는 중…</main>;
  if (!course) return <main style={{ padding: 24 }}>코스를 찾을 수 없습니다.</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      {enrolled ? (
        <>
          <h3 style={{ marginTop: 24 }}>레슨 목록</h3>
          <ul style={{ display: 'grid', gap: 8 }}>
            {lessons.map(l => (
              <li key={l.id}>
                <a href={`/learn/${l.id}`}>{l.sort_order}. {l.title}</a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={handleEnroll}>수강신청</button>
      )}

      <div style={{ marginTop: 16 }}>
        <a href="/courses">◀ 강의 목록으로</a>
      </div>
    </main>
  );
}
