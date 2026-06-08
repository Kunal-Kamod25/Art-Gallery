'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Github } from 'lucide-react';
import { useAuthStore } from '../../../lib/store';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.includes('@')) return toast.error('Please enter a valid email');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.push(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col md:flex-row font-sans selection:bg-amber-500/30">
      {/* ─── Left Section: Visual ─── */}
      <div className="hidden lg:flex flex-1 bg-[#0d1321] relative flex-col justify-center p-20 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-600/10 rounded-full blur-[150px]" />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-10 inline-flex p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl shadow-amber-500/10">
            <Sparkles size={40} className="text-amber-500" />
          </div>
          
          <h2 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
            Welcome <span className="text-amber-500">Back.</span><br />
            <span className="text-2xl text-neutral-400 font-medium">Continue your artistic journey.</span>
          </h2>
          
          <p className="text-neutral-500 text-lg mb-12 leading-relaxed">
            Kalakriti is the premier destination for discovering extraordinary art and connecting with creators globally.
          </p>

          <div className="glass-card p-6 rounded-2xl border-white/5 bg-white/5">
            <p className="text-neutral-400 italic text-sm">
              &ldquo;Art washes away from the soul the dust of everyday life.&rdquo;
            </p>
            <p className="text-amber-500 text-xs font-bold mt-3 tracking-widest uppercase">— Pablo Picasso</p>
          </div>
        </div>
      </div>

      {/* ─── Right Section: Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md z-10">
          <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
            <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">KALAKRITI</span>
            </Link>

            <h1 className="text-4xl font-bold mb-2 tracking-tight">Sign <span className="text-amber-500">In</span></h1>
            <p className="text-neutral-400 mb-8">Access your collection and favorites.</p>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl hover:bg-white/10 transition-all group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.73 0 3.01.67 3.86 1.34l2.9-2.9C16.81 1.84 14.63 1 12 1 7.48 1 3.65 3.93 2.18 8.08l3.43 2.66c.82-2.45 3.12-4.7 6.39-4.7z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.57-.2-2.31H12v4.38h6.44c-.28 1.48-1.11 2.73-2.36 3.58l3.68 2.85c2.15-1.98 3.39-4.9 3.39-8.5z" />
                  <path fill="#FBBC05" d="M5.61 14.74c-.23-.69-.36-1.42-.36-2.19 0-.77.13-1.5.36-2.19L2.18 7.7C1.45 9.17 1 10.82 1 12.58s.45 3.41 1.18 4.88l3.43-2.72z" />
                  <path fill="#34A853" d="M12 23c3.15 0 5.79-1.04 7.72-2.83l-3.68-2.85c-1.03.69-2.34 1.1-3.77 1.1-3.13 0-5.78-2.11-6.73-4.94l-3.46 2.69C3.76 20.1 7.55 23 12 23z" />
                </svg>
                <span className="text-sm font-semibold group-hover:text-amber-500 transition-colors">Continue with Google</span>
              </button>
            </div>

            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#0b0f1a] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Or with Email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="name@example.com"
                    required
                    className="glass-input pl-12"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Password</label>
                  <Link href="/auth/forgot" className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:underline">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="glass-input pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full flex items-center justify-center gap-2 group mt-2 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 tracking-widest uppercase text-xs font-bold">Sign In</span>
                    <ArrowRight size={16} className="relative z-10" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-neutral-500 mt-8">
                New to the gallery?{' '}
                <Link href="/auth/register" className="text-amber-500 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
