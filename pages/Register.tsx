
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, User, Mail, Lock, Building } from 'lucide-react';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center border-b border-slate-100">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-50 mb-4">
                <Box className="w-6 h-6 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Hesap Oluştur</h1>
            <p className="text-slate-500 mt-1 text-sm">VDA süreçlerinizi yönetmek için ücretsiz başlayın.</p>
        </div>
        
        <div className="p-8">
            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ad</label>
                        <input type="text" className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Soyad</label>
                        <input type="text" className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şirket Adı</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-4 w-4 text-slate-400" />
                        </div>
                        <input type="text" className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-Posta</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input type="email" className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şifre</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input type="password" className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                </div>

                <button type="button" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors mt-4">
                    Kayıt Ol
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                Zaten hesabınız var mı? <Link to="/login" className="text-brand-600 font-bold hover:underline">Giriş Yap</Link>
            </div>
        </div>
      </div>
    </div>
  );
};
