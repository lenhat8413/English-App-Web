import { useEffect, useState } from 'react';
import api from '../api/http';

export default function Profile() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get('/protected/me')
      .then(res => setData(res.data))
      .catch(e => setErr(e?.response?.data?.error?.message || e.message));
  }, []);

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  if (err) {
    return (
      <div style={{maxWidth: 640, margin: '80px auto', fontFamily:'system-ui'}}>
        <h2>Profile</h2>
        <p style={{color:'crimson'}}>Error: {err}</p>
        <button onClick={() => window.location.href='/login'}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 640, margin: '80px auto', fontFamily:'system-ui'}}>
      <h2>Profile</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
