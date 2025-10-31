'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Course = { id: string; title: string; description: string | null };

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) 로그인 확인
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.replace('/login');
        return;
      }

      // 2) 내가 수강 중인 course_id 목록
      const { data: enr, error: e1 } = await supabase
        .from('enrollments')
        .select('course_id')
        .order('enrolled_at', { ascending: false });

      if (e1) {
        console.error(e1);
        setLoading(false);
        return;
      }

      const ids = (enr ?? []).map((r) => r.course_id);
      if (ids.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // 3) 해당 코스들 상세 조회
      const { data: cs, error: e2 } = await supabase
        .from('courses')
        .select('*')
        .in('id', ids);

      if (e2) {
        console.error(e2);
        setLoading(false);
        return;
      }

      // 4) 원래 수강 순서대로 정렬
      const map = new Map((cs ?? []).map((c) => [c.id, c]));
      const ordered = ids
        .map((id) => map.get(id))
        .filter((c): c is Course => Boolean(c));
      setCourses(ordered);

      setLoading(false);
    })();
  }, [router]);

  if (loading) return <main style={{ padding: 24 }}>불러오는 중…</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>내 강의</h1>

      {courses.length === 0 ? (
        <>
          <p>수강 중인 강의가 없습니다.</p>
          <a href="/courses">강의 목록 보러가기 →</a>
        </>
      ) : (
        <ul style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {courses.map((c) => (
            <li key={c.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <h3 style={{ margin: 0 }}>{c.title}</h3>
              <p style={{ margin: '6px 0 12px' }}>{c.description}</p>
              <a href={`/courses/${c.id}`}>강의로 이동 →</a>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 16 }}>
        <a href="/">◀ 홈으로</a>
      </div>
    </main>
  );
}
