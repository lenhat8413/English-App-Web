import { useState } from 'react';
import api from '../api/http';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com'); // tiện test
  const [password, setPassword] = useState('admin123');
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/';
    } catch (err: any) {
      setMsg(err?.response?.data?.error?.message || 'Login failed');
    }
  }

  return (
    <div style={{maxWidth: 360, margin: '80px auto', fontFamily: 'system-ui'}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div style={{marginBottom: 12}}>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}}/>
        </div>
        <div style={{marginBottom: 12}}>
          <label>Password</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}}/>
        </div>
        <button type="submit">Sign in</button>
      </form>
      {msg && <p style={{color:'crimson'}}>{msg}</p>}
    </div>
  );
}
