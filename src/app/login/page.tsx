'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // ← 경로가 다르면 알려주세요!

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ 회원가입 성공! 이제 로그인해보세요.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('🎉 로그인 성공! 메인 페이지로 이동합니다.');
        window.location.href = '/'; // 홈으로 이동
      }
    } catch (error: any) {
      setMessage(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: '60px auto', padding: 20, display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>
        {mode === 'signup' ? '회원가입' : '로그인'}
      </h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setMode('signin')} disabled={mode === 'signin'}>
          로그인
        </button>
        <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : mode === 'signup' ? '회원가입' : '로그인'}
        </button>
      </form>

      {message && <p style={{ color: 'blue' }}>{message}</p>}
    </main>
  );
}
