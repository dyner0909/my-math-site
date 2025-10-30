'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Course = { id: string; title: string; description: string | null };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    supabase.from('courses').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setCourses(data);
      });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>강의 목록</h1>
      <ul style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {courses.map(c => (
          <li key={c.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>{c.title}</h3>
            <p style={{ margin: '6px 0 12px' }}>{c.description}</p>
            <a href={`/courses/${c.id}`}>상세보기 →</a>
          </li>
        ))}
      </ul>
      <a href="/" style={{ display: 'inline-block', marginTop: 16 }}>◀ 홈으로</a>
    </main>
  );
}
