'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, Palette, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { useAuthStore } from '../../../lib/store';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!/[A-Z]/.test(form.password)) return toast.error('Password must contain an uppercase letter');
    if (!/[0-9]/.test(form.password)) return toast.error('Password must contain a number');
    
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to Luminary.');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col md:flex-row font-sans selection:bg-amber-500/30">
      {/* ─── Left Section: Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-xl z-10">
          <div className="glass-card p-8 md:p-10 rounded-[2rem] border-white/5">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">LUMINARY</span>
            </Link>

            <h1 className="text-4xl font-bold mb-2 tracking-tight">Create <span className="text-amber-500">account</span></h1>
            <p className="text-neutral-400 mb-8">Join thousands of collectors and artists today.</p>

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

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'user' }))}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                  form.role === 'user'
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${form.role === 'user' ? 'bg-amber-500 text-white' : 'bg-white/10 text-neutral-400'}`}>
                  <ShoppingCart size={22} />
                </div>
                <span className={`font-semibold ${form.role === 'user' ? 'text-white' : 'text-neutral-400'}`}>Collector</span>
                <span className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Buy & curate</span>
              </button>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'artist' }))}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                  form.role === 'artist'
                    ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${form.role === 'artist' ? 'bg-blue-500 text-white' : 'bg-white/10 text-neutral-400'}`}>
                  <Palette size={22} />
                </div>
                <span className={`font-semibold ${form.role === 'artist' ? 'text-white' : 'text-neutral-400'}`}>Artist</span>
                <span className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Sell & showcase</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                    className="glass-input pl-12"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="name@company.com"
                    required
                    className="glass-input pl-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Password</label>
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Confirm</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="glass-input pl-12"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {form.password && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Security Strength</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${strengthColors[strength].replace('bg-', 'text-')}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-1 mb-4">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-y-2">
                    {[
                      { label: '8+ Characters', check: form.password.length >= 8 },
                      { label: 'Uppercase', check: /[A-Z]/.test(form.password) },
                      { label: 'Number', check: /[0-9]/.test(form.password) },
                      { label: 'Symbol', check: /[^A-Za-z0-9]/.test(form.password) },
                    ].map(req => (
                      <div key={req.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.check ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-neutral-600'}`}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className={`text-[10px] font-medium ${req.check ? 'text-neutral-300' : 'text-neutral-500'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full flex items-center justify-center gap-2 group mt-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 tracking-widest uppercase text-xs font-bold">Create Account</span>
                    <Sparkles size={16} className="relative z-10" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-neutral-500 mt-6">
                Already part of the community?{' '}
                <Link href="/auth/login" className="text-amber-500 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Right Section: Visual ─── */}
      <div className="hidden lg:flex flex-1 bg-[#0d1321] relative flex-col justify-center p-20 overflow-hidden border-l border-white/5">
        {/* Abstract background elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px]" />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-10 inline-flex p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
            <Sparkles size={40} className="text-amber-500" />
          </div>
          
          <h2 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
            Discover. Collect.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Grow your art.
            </span>
          </h2>
          
          <p className="text-neutral-400 text-lg mb-12 leading-relaxed">
            Everything you need to <span className="text-amber-400 font-semibold">explore, trade, and showcase</span> extraordinary artworks from the world's most talented creators.
          </p>

          {/* Feature Cards */}
          <div className="space-y-6">
            {[
              { icon: ShieldCheck, title: 'Authenticity Guaranteed', desc: 'Every piece is verified with a digital certificate of authenticity.' },
              { icon: Sparkles, title: 'AI-Powered Curation', desc: 'Discover art tailored to your taste with our advanced suggestion engine.' },
              { icon: Lock, title: 'Secure Transactions', desc: 'Advanced encryption ensuring your data and funds are always safe.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex gap-5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                  <feature.icon className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
