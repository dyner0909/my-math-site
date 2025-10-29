'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 안 되면 '../../lib/supabase'

export default function MyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login'); // 미로그인 → 로그인 화면으로
        return;
      }
      setEmail(data.user.email ?? null);
      setReady(true);
    };
    run();
  }, [router]);

  if (!ready) return <main style={{ padding: 32 }}>확인 중…</main>;

  return (
    <main style={{ padding: 32 }}>
      <h1>마이페이지</h1>
      <p>안녕하세요, <b>{email}</b> 님!</p>
      <a href="/">◀ 홈으로</a>
    </main>
  );
}
