import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Menu, X, ShieldCheck, PhoneCall } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos } from '@/components/TopBarLogos';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  { name: 'Complaint', href: '/#complaint' },
  { name: 'Contact', href: '/#contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top-most 4 Logos Strip (2 Left, 2 Right) */}
      <TopBarLogos variant="public" />

      {/* 2. Official Government Strip */}
      <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-ukgreen-900/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              उत्तराखंड शासन
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-300">
              Government of Uttarakhand • Zila Panchayat Digital Services
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>Helpline: <strong className="text-white">1800-185-1850</strong></span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Uttarakhand Flag/Accent Tricolor Bar */}
      <div className="uk-tricolor-line" />

      {/* Main Header Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-navy-900 text-white flex items-center justify-center border border-navy-700 shadow-xs">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-poppins font-bold text-navy-900 text-lg sm:text-xl tracking-tight leading-none">
                  Zila Panchayat Safai
                </span>
              </div>
              <span className="text-[11px] font-medium text-ukgreen-800 tracking-wide uppercase block mt-0.5">
                Smart Waste Collection Tracking System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-slate-300 text-navy-900 hover:bg-slate-50" asChild>
              <Link to="/signup">Admin Sign Up</Link>
            </Button>
            <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-navy-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-200 overflow-hidden bg-slate-50 border-t border-slate-200 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
            <Button variant="outline" size="sm" className="w-full justify-center" asChild>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>Admin Sign Up</Link>
            </Button>
            <Button size="sm" className="w-full justify-center bg-navy-900 text-white" asChild>
              <Link to="/signin" onClick={() => setMobileOpen(false)}>Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
