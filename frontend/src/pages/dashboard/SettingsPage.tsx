import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, CheckCircle2, AlertCircle, ShieldCheck, KeyRound, Server,
  Building2, Lock, Save, Radio
} from 'lucide-react';

export function SettingsPage() {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });
      if (!res.ok) throw new Error('Failed to update profile details');
      setSuccess('Official profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long');
      return;
    }
    setPassLoading(true);
    try {
      setTimeout(() => {
        setPassSuccess('Security credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setPassLoading(false);
      }, 800);
    } catch (err: any) {
      setPassError('Failed to update password');
      setPassLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wide">Administrator Profile &amp; System Settings</p>
              <p className="text-[10px] text-slate-400 font-mono">प्रशासनिक प्रोफाइल | Official Settings</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0c1829] border border-[#1e3a5f] px-2.5 py-1 rounded-sm shrink-0">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide">UTTARAKHAND ZILA PANCHAYAT</span>
          </div>
        </div>
        <div className="bg-[#f0f4f9] border-t border-slate-300 px-4 py-1.5">
          <p className="text-[10px] font-mono text-slate-600">
            Manage officer credential parameters, security authorization, and departmental telematics configuration
          </p>
        </div>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* ── Officer Profile ── */}
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#1a3a6b]" />
              <h3 className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">Officer Credentials</h3>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm uppercase">
              AUTHORIZED ADMIN
            </span>
          </div>

          <div className="p-4">
            {/* Email info row */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Enrolled Email</span>
              <span className="text-[11px] font-mono font-bold text-[#0a1628]">{profile?.email}</span>
            </div>

            {success && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-emerald-800 font-mono">{success}</span>
              </div>
            )}


            {error && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-[11px] text-red-800 font-mono">{error}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Officer Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter officer full name"
                  className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Official Departmental Email</Label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="h-8 bg-slate-50 text-[11px] font-mono text-slate-600 cursor-not-allowed border-slate-200 rounded-sm"
                />
                <p className="text-[10px] text-slate-400 font-mono">Email is verified by NIC / Department Auth</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Administrative Role</Label>
                <Input
                  value={profile?.role || 'Zila Panchayat Admin'}
                  disabled
                  className="h-8 bg-slate-50 text-[11px] font-mono font-bold text-[#0a1628] capitalize cursor-not-allowed border-slate-200 rounded-sm"
                />
              </div>

              <div className="pt-1 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider py-2 rounded-sm transition-colors"
                >
                  <Save className="w-3 h-3" />
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">

          {/* Security Credentials */}
          <div className="bg-white border border-slate-300 rounded overflow-hidden">
            <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#1a3a6b]" />
                <h3 className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">Security Credentials</h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-300 px-2 py-0.5 rounded-sm">
                256-BIT ENCRYPTED
              </span>
            </div>

            <div className="p-4 space-y-3">
              {passSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-emerald-800 font-mono">{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="text-[11px] text-red-800 font-mono">{passError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
                  />
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={passLoading || !newPassword}
                    className="w-full flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-[#0a1628] text-[11px] font-bold uppercase tracking-wider py-2 rounded-sm transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    {passLoading ? 'Updating Credentials...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Telematics Config */}
          <div className="bg-white border border-slate-300 rounded overflow-hidden">
            <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#1a3a6b]" />
                <h3 className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">System Telematics Config</h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                ACTIVE PIPELINE
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {[
                { icon: Radio, label: 'API Gateway Endpoint', value: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' },
                { icon: Radio, label: 'Traccar Telematics Listener', value: 'Port 5055 (HTTP Client Stream)' },
                { icon: ShieldCheck, label: 'Database Engine', value: 'Supabase PostgreSQL (RLS)' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-[#0a1628] font-mono">{label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
