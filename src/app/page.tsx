'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
// app/page.tsx → lib는 한 단계 위: ../lib/supabase
import { supabase } from '../lib/supabase';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 최초 유저 확인
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // 로그인/로그아웃 상태 변화 구독
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange로 userEmail이 null로 바뀌면서 UI가 갱신됩니다.
  };

  return (
    <main style={{ padding: 32, display: 'grid', gap: 12 }}>
      <h1>Hello, this is my first math site!</h1>

      {userEmail ? (
        <>
          <p>로그인됨: <b>{userEmail}</b></p>
          <button onClick={onLogout}>로그아웃</button>
          <a href="/my" style={{ width: 'fit-content' }}>마이페이지 →</a>
        </>
      ) : (
        <a href="/login">로그인 하러가기 →</a>
      )}
    </main>
  );
}
