import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('auth/captcha');
      const json = res.data;
      if (json.success) {
        setCaptchaQuestion(json.data.question);
        setCaptchaToken(json.data.token);
      }
    } catch (err) {
      console.error('Error fetching captcha:', err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('auth/login', {
        username, password, captchaAnswer, captchaToken
      });

      const json = res.data;

      if (json.success) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('role', json.data.user.role);
        localStorage.setItem('username', json.data.user.username);
        if (json.data.user.id_agente) {
          localStorage.setItem('id_agente', json.data.user.id_agente);
        }

        // Redirección relativa para seguridad en subcarpetas
        if (json.data.user.role === 'agente') {
          navigate('/agent-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(json.message || 'Error en el login');
        fetchCaptcha();
        setCaptchaAnswer('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
      console.error('Login error:', err);
      fetchCaptcha();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">SISCON-AI</h1>
          <p className="text-sm text-slate-500 uppercase tracking-wider">Ecosistema Cognitivo</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Usuario</label>
            <input
              type="text"
              className="input-modern"
              placeholder="admin o agente"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Contraseña</label>
            <input
              type="password"
              className="input-modern"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Verificación de Seguridad</label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-primary">{captchaQuestion}</span>
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-xs text-slate-400 hover:text-primary transition-colors"
              >
                🔄 Recargar
              </button>
            </div>
            <input
              type="number"
              className="input-modern"
              placeholder="Tu respuesta"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3 rounded-2xl text-sm font-bold">
            Ingresar al Sistema
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Uso exclusivo para personal autorizado.
        </p>
      </div>
    </div>
  );
}

export default Login;
