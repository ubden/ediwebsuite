
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    login(email, 'Can KURT');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-600 mb-4 shadow-lg shadow-brand-900/50">
                <Box className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LogiTech VDA Suite</h1>
            <p className="text-slate-400 mt-2 text-sm">Kurumsal Lojistik Yönetim Platformu</p>
        </div>
        
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="email" 
                            required
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            placeholder="ornek@sirket.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="password" 
                            required
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                        <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white" />
                        <span className="ml-2 text-slate-600">Beni Hatırla</span>
                    </label>
                    <a href="#" className="text-brand-600 hover:text-brand-800 font-medium">Şifremi Unuttum?</a>
                </div>

                <button type="submit" className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200">
                    Giriş Yap
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                Hesabınız yok mu? <Link to="/register" className="text-brand-600 font-bold hover:underline">Kayıt Olun</Link>
            </div>
        </div>
      </div>
    </div>
  );
};
