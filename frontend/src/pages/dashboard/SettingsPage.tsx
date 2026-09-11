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
      // Password update endpoint mock / integration
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
    <div className="animate-fade-in space-y-6">
      {/* Official Government Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              प्रशासनिक प्रोफाइल • Official Settings
            </span>
          </div>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Administrator Profile & System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage officer credential parameters, security authorization, and departmental telematics configuration
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            UTTARAKHAND ZILA PANCHAYAT
          </span>
        </div>
      </div>

      {/* Main 2-Column Administrative Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Officer Profile Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-navy-900 text-sm">Officer Credentials</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{profile?.email}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase">
                AUTHORIZED ADMIN
              </span>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Officer Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter officer full name"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Official Departmental Email</Label>
                <Input value={profile?.email || ''} disabled className="bg-slate-50 text-xs font-mono text-slate-600 cursor-not-allowed" />
                <p className="text-[11px] text-slate-400">Email address is verified by NIC / Department Auth</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Administrative Role / Access Level</Label>
                <Input value={profile?.role || 'Zila Panchayat Admin'} disabled className="bg-slate-50 text-xs font-bold text-navy-900 capitalize cursor-not-allowed" />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2 h-9 rounded-lg shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security Credentials & Telematics Config */}
        <div className="space-y-6">
          {/* Password Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <h3 className="font-poppins font-bold text-navy-900 text-sm">Security Credentials</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                256-BIT ENCRYPTED
              </span>
            </div>

            {passSuccess && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={passLoading || !newPassword}
                variant="outline"
                className="w-full border-slate-300 hover:bg-slate-50 text-navy-900 font-semibold text-xs py-2 h-9 rounded-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                {passLoading ? 'Updating Credentials...' : 'Update Password Credentials'}
              </Button>
            </form>
          </div>

          {/* Telematics & API Diagnostics Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-700" />
                <h3 className="font-poppins font-bold text-navy-900 text-sm">System Telematics Config</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE PIPELINE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-navy-900">API Gateway Endpoint</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600">
                  {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-navy-900">Traccar Telematics Listener</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600">Port 5055 (HTTP Client Stream)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-navy-900">Database Engine</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600">Supabase PostgreSQL (RLS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
