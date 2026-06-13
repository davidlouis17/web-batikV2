import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Shield, Mail, Lock, Sparkles, ArrowLeft, Loader2, Info } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (user: any) => void;
  onGoBack: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export default function AdminLogin({ onSuccess, onGoBack, onNotify }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onNotify('Harap isi semua kolom kredensial!', 'error');
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // Check if credentials match any locally-registered bypass manager
      let localBypassMatch = false;
      try {
        const savedAdmins = localStorage.getItem('batik_registered_bypass_admins');
        const list = savedAdmins ? JSON.parse(savedAdmins) : [];
        localBypassMatch = list.some((item: any) => item.email === cleanEmail && item.password === password);
      } catch (errLocal) {
        console.error('Failed to parse local bypass list:', errLocal);
      }
      
      if (cleanEmail === 'davidlouis857@gmail.com' && password === 'password') {
        try {
          const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
          onNotify('Otentikasi berhasil! Selamat datang di Dashboard Admin.', 'success');
          onSuccess(res.user);
        } catch (innerError: any) {
          if (
            innerError.code === 'auth/configuration-not-found' ||
            innerError.code === 'auth/operation-not-allowed' ||
            innerError.code === 'auth/unauthorized-domain'
          ) {
            console.warn('Firebase Auth is not fully configured. Bypassing safely for manager login.');
            onNotify('Masuk Berhasil (Mode Bypass Firestore)! Selamat datang di Dashboard.', 'success');
            const mockUser = { email: cleanEmail, uid: 'bypass-admin', isBypass: true };
            localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
            onSuccess(mockUser);
            return;
          }
          try {
            const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            onNotify('Akun administrator otomatis didaftarkan dan diaktifkan!', 'success');
            onSuccess(res.user);
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              throw innerError;
            } else if (
              createErr.code === 'auth/configuration-not-found' ||
              createErr.code === 'auth/operation-not-allowed' ||
              createErr.code === 'auth/unauthorized-domain'
            ) {
              console.warn('Firebase Auth is not fully configured on signup. Bypassing safely.');
              onNotify('Masuk Berhasil (Mode Bypass Firestore)! Selamat datang di Dashboard.', 'success');
              const mockUser = { email: cleanEmail, uid: 'bypass-admin', isBypass: true };
              localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
              onSuccess(mockUser);
            } else {
              throw createErr;
            }
          }
        }
      } else if (localBypassMatch) {
        try {
          const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
          onNotify('Otentikasi berhasil! Selamat datang di Dashboard Admin.', 'success');
          onSuccess(res.user);
        } catch (innerError: any) {
          console.warn('Firebase error for locally registered admin. Log in via Bypass mode.', innerError);
          onNotify('Otentikasi berhasil (Mode Bypass)! Selamat datang di Dashboard.', 'success');
          const mockUser = { email: cleanEmail, uid: `bypass-${Date.now()}`, isBypass: true };
          localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
          onSuccess(mockUser);
        }
      } else {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        onNotify('Otentikasi berhasil! Selamat datang di Dashboard Admin.', 'success');
        onSuccess(res.user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const cleanEmail = email.trim().toLowerCase();
      
      // Look up local list as failsafe
      let matchedLocal = false;
      try {
        const savedAdmins = localStorage.getItem('batik_registered_bypass_admins');
        const list = savedAdmins ? JSON.parse(savedAdmins) : [];
        matchedLocal = list.some((item: any) => item.email === cleanEmail && item.password === password);
      } catch (e) {}

      if (matchedLocal) {
        onNotify('Otentikasi berhasil (Bypass Aktif)! Selamat datang di Dashboard.', 'success');
        const mockUser = { email: cleanEmail, uid: `bypass-${Date.now()}`, isBypass: true };
        localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
        onSuccess(mockUser);
        return;
      }

      let errMsg = 'Gagal melakukan otentikasi. Periksa kembali email dan sandi.';
      
      if (
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/operation-not-allowed' || 
        error.code === 'auth/unauthorized-domain'
      ) {
        // If they enter credentials but Firebase auth has issues, we check if they entered default or got configuration error
        if (cleanEmail === 'davidlouis857@gmail.com' && password === 'password') {
          onNotify('Masuk Berhasil (Bypass Aktif karena Firebase Auth belum diaktifkan)!', 'success');
          const mockUser = { email: cleanEmail, uid: 'bypass-admin', isBypass: true };
          localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
          onSuccess(mockUser);
          return;
        } else {
          errMsg = 'Firebase Authentication belum sepenuhnya dikonfigurasi atau domain ini belum terdaftar di Authorized Domains Firebase Anda.';
        }
      } else if (
        error.code === 'auth/invalid-login-credentials' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential'
      ) {
        errMsg = 'Sandi salah atau email pengelola tidak terdaftar.';
      } else if (error.message) {
        errMsg = `Gagal melakukan otentikasi: ${error.message}`;
      }
      onNotify(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onNotify('Masukkan email untuk pemulihan kata sandi.', 'error');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      onNotify('Tautan atur ulang sandi telah dikirim ke email Anda!', 'success');
      setForgotPassword(false);
    } catch (error: any) {
      console.error(error);
      onNotify('Gagal mengirim email pemulihan. Pastikan email terdaftar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDE9ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-[#8B0022]/10 relative overflow-hidden">
        
        {/* Artistic Batik background accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-[#8B0022]/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-[#C92C53]/5 rounded-full blur-2xl"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-[#8B0022] shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-xl font-serif font-bold text-slate-800 uppercase tracking-widest">
            {forgotPassword ? 'Pulihkan Sandi' : 'Akses Dashboard Admin'}
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400 max-w-xs mx-auto">
            {forgotPassword 
              ? 'Tautan pemulihan akan dikirim langsung ke alamat email terdaftar.'
              : 'Otentikasi khusus penguji dan administrator Asosiasi Batik Jawa Timur.'
            }
          </p>
        </div>

        {forgotPassword ? (
          <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
            <div className="relative">
              <label htmlFor="recovery-email" className="sr-only">Email Admin</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="recovery-email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-batik-primary text-slate-850 placeholder-slate-400 bg-slate-50 focus:outline-none"
                placeholder="Alamat Email Terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForgotPassword(false)}
                className="w-1/2 flex justify-center py-2.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition uppercase"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 flex justify-center py-2.5 px-4 bg-batik-primary hover:bg-[#C92C53] text-white rounded-lg text-xs font-bold transition uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'KIRIM LINK'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="relative">
                <label htmlFor="admin-email" className="sr-only">Email Admin</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-batik-primary text-slate-850 placeholder-slate-400 bg-slate-50 focus:outline-none"
                  placeholder="Email Pengelola"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <label htmlFor="admin-password" className="sr-only">Kata Sandi</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-batik-primary text-slate-850 placeholder-slate-400 bg-slate-50 focus:outline-none"
                  placeholder="Kata Sandi Admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                Lupa sandi?
              </button>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 bg-batik-primary hover:bg-[#C92C53] text-white rounded-lg text-xs font-bold transition shadow-md uppercase tracking-wider items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    MASUK KE CONSOLE
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onGoBack}
                className="w-full flex justify-center py-2.5 px-4 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase"
              >
                Kembali ke Beranda
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-slate-400 text-[10px] leading-normal font-sans">
          <Info className="w-3.5 h-3.5 text-[#8B0022] shrink-0 mt-0.5" />
          <span>
            <strong>Catatan Masuk:</strong> Akun default Anda telah disiapkan oleh sistem. Silakan login langsung menggunakan email <strong>davidlouis857@gmail.com</strong> dan kata sandi <strong>password</strong>.
          </span>
        </div>

      </div>
    </div>
  );
}
