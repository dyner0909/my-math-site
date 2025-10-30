'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lesson = { id: string; title: string; video_url: string; course_id: string };

export default function LearnPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // RLS에 의해: 수강하지 않았다면 여기서 data가 안 나옵니다(에러/빈값)
      const { data, error } = await supabase
        .from('lessons')
        .select('id,title,video_url,course_id')
        .eq('id', lessonId)
        .maybeSingle();

      if (error || !data) {
        alert('수강신청이 필요합니다.');
        router.replace('/courses');
        return;
      }

      setLesson(data);
      setLoading(false);
    })();
  }, [lessonId, router]);

  if (loading) return <main style={{ padding: 24 }}>불러오는 중…</main>;
  if (!lesson) return null;

  return (
    <main style={{ padding: 24 }}>
      <h1>{lesson.title}</h1>

      {/* MVP: 단순 video 태그 재생 (mp4 URL) */}
      <video
        src={lesson.video_url}
        controls
        style={{ width: '100%', maxWidth: 900, borderRadius: 8, marginTop: 12 }}
      />

      <div style={{ marginTop: 16 }}>
        <a href={`/courses/${lesson.course_id}`}>◀ 레슨 목록으로</a>
      </div>
    </main>
  );
}
