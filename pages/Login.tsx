import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Navigation is handled in AuthContext via window.location for full reload
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-slate-950 p-6 transition-colors">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10 animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
             <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-dark dark:text-white mb-2">NetKart'a Dön</h1>
          <p className="text-gray-500 dark:text-gray-400">Kaldığın yerden devam et ve hedeflerine ulaş.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
           {error && (
             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H5.045c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
               {error}
             </div>
           )}

           <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kullanıcı Adı</label>
               <input 
                 type="text" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 font-bold text-dark dark:text-white transition-all"
                 placeholder="Kullanıcı adın"
                 required
               />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Şifre</label>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 font-bold text-dark dark:text-white transition-all"
                 placeholder="••••••"
                 required
               />
             </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-4 mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center"
           >
             {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Giriş Yap'}
           </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;