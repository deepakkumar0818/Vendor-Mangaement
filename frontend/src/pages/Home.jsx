import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Users, FileText, GitCompare, BarChart3, Award, LineChart, Star,
  ArrowRight, CheckCircle, TrendingUp, ShieldCheck, Zap, Globe,
  ChevronRight, Package, Clock, DollarSign, Target, Activity
} from 'lucide-react';

const stats = [
  { end: 2400, format: n => n.toLocaleString() + '+', label: 'Vendors Managed'    },
  { end: 98,   format: n => n + '%',                  label: 'Quote Accuracy'      },
  { end: 35,   format: n => n + '%',                  label: 'Cost Savings Avg.'   },
  { end: 12,   format: n => n + ' min',               label: 'Avg. RFQ Response'   },
];

function CountUp({ end, format, duration = 1800 }) {
  const [count,   setCount]   = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let raf;
    const tick = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return <span ref={ref}>{format(count)}</span>;
}

const features = [
  {
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'Vendor Master',
    desc: 'Centralize all vendor profiles, contacts, categories, certifications, and compliance documents in one searchable directory.',
  },
  {
    icon: FileText,
    color: 'bg-blue-100 text-blue-600',
    title: 'RFQ & Quote Capture',
    desc: 'Issue RFQs to multiple vendors simultaneously. Collect, organize, and track quotations with automated follow-up reminders.',
  },
  {
    icon: GitCompare,
    color: 'bg-violet-100 text-violet-600',
    title: 'Price Comparison',
    desc: 'Compare vendor quotes side-by-side, calculate landed cost, margins, and instantly identify the most competitive offer.',
  },
  {
    icon: BarChart3,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Performance Tracking',
    desc: 'Monitor KPIs — response time, order success rate, delivery reliability, and defect ratio — across every vendor automatically.',
  },
  {
    icon: Award,
    color: 'bg-amber-100 text-amber-600',
    title: 'Vendor Scorecards',
    desc: 'Auto-generate scorecards using weighted KPI formulas. Classify vendors as Preferred, Regular, or Monitor with zero manual effort.',
  },
  {
    icon: LineChart,
    color: 'bg-rose-100 text-rose-600',
    title: 'Intelligence Analytics',
    desc: 'Drill into spend patterns, category-wise vendor rankings, savings trends, and procurement efficiency dashboards.',
  },
];

const steps = [
  {
    step: '01',
    icon: Package,
    title: 'Onboard Your Vendors',
    desc: 'Import existing vendor data or add vendors manually. Assign categories, contacts, and compliance tags instantly.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Issue RFQs & Collect Quotes',
    desc: 'Create an RFQ in seconds, notify multiple vendors at once, and receive structured quotes directly into the system.',
  },
  {
    step: '03',
    icon: GitCompare,
    title: 'Compare & Select the Best',
    desc: 'Use the side-by-side comparison engine to evaluate price, delivery, and terms — then award with one click.',
  },
  {
    step: '04',
    icon: Award,
    title: 'Track & Score Automatically',
    desc: 'Every order feeds back into vendor KPIs. Scorecards update in real-time so your preferred vendor list is always accurate.',
  },
];

const benefits = [
  { icon: DollarSign, text: 'Reduce procurement costs by up to 35%' },
  { icon: Clock, text: 'Cut quote processing time from days to minutes' },
  { icon: ShieldCheck, text: 'Ensure compliance with automated vendor checks' },
  { icon: Target, text: 'Always source from your best-performing vendors' },
  { icon: Activity, text: 'Real-time KPI dashboards — no manual reporting' },
  { icon: Zap, text: 'Automated reminders and scoring — zero effort' },
];

const categories = [
  { label: 'Raw Materials', count: '340+ vendors' },
  { label: 'IT & Software', count: '210+ vendors' },
  { label: 'Logistics', count: '180+ vendors' },
  { label: 'Manufacturing', count: '290+ vendors' },
  { label: 'MRO Supplies', count: '150+ vendors' },
  { label: 'Professional Svcs', count: '120+ vendors' },
  { label: 'Packaging', count: '95+ vendors' },
  { label: 'Utilities', count: '60+ vendors' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Head of Procurement, NovaTech Industries',
    avatar: 'SM',
    color: 'bg-indigo-500',
    quote: 'We reduced our vendor evaluation cycle from 3 weeks to 2 days. The scorecard automation alone saved our team 20+ hours per month.',
  },
  {
    name: 'Rajiv Menon',
    role: 'Supply Chain Director, Apex Manufacturing',
    avatar: 'RM',
    color: 'bg-violet-500',
    quote: 'The price comparison module is a game changer. We identified a 28% cost saving on our top 5 categories in the first quarter.',
  },
  {
    name: 'Linda Hartmann',
    role: 'CPO, GlobalBridge Logistics',
    avatar: 'LH',
    color: 'bg-emerald-500',
    quote: 'Finally, a system that gives us full visibility into vendor performance. Our preferred vendor compliance went from 60% to 94%.',
  },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden min-h-[88vh] flex items-center">

        {/* soft dot grid background */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, #e0e7ff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
        />

        {/* large indigo blob — top right */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-indigo-50 rounded-full pointer-events-none" />
        {/* small violet blob — bottom left */}
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-violet-50 rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full grid lg:grid-cols-2 gap-14 items-center">

          {/* ── LEFT: text ── */}
          <div>
            {/* badge */}
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-7">
              <Zap size={13} className="text-indigo-500" />
              Vendor Intelligence Platform — v2.0
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.15] tracking-tight text-gray-900 mb-6">
              Smarter Vendor Management.
              <br />
              <span className="text-indigo-600">Faster Procurement.</span>
            </h1>

            <p className="text-lg text-gray-500 mb-9 max-w-xl leading-relaxed">
              Collect quotes, compare prices, track vendor KPIs, and auto-generate scorecards —
              all in one platform built for modern procurement teams.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
              >
                Go to Dashboard <ArrowRight size={17} />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-full hover:bg-gray-50 hover:border-indigo-200 transition shadow-sm"
              >
                See All Features
              </Link>
            </div>

            {/* trust row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
              {['No credit card required', 'Free 14-day trial', 'Setup in 10 min'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: visual mockup ── */}
          <div className="relative hidden lg:block">
            {/* outer card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-6 space-y-4">

              {/* top bar */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-700">Vendor Overview</p>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 rounded-full">Live</span>
              </div>

              {/* stat mini-cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Vendors', val: '128', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Open RFQs', val: '34', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Avg. Score', val: '79', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(c => (
                  <div key={c.label} className={`${c.bg} rounded-2xl p-4 text-center`}>
                    <p className={`text-2xl font-extrabold ${c.color}`}>{c.val}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* vendor list */}
              <div className="space-y-2 pt-1">
                {[
                  { name: 'AlphaTech Supplies', score: 94, tag: 'Preferred', bar: 'bg-emerald-400', tagCls: 'bg-emerald-100 text-emerald-700' },
                  { name: 'BlueOcean Materials', score: 78, tag: 'Regular', bar: 'bg-amber-400', tagCls: 'bg-amber-100 text-amber-700' },
                  { name: 'CheapBulk Co.', score: 42, tag: 'Monitor', bar: 'bg-rose-400', tagCls: 'bg-rose-100 text-rose-700' },
                ].map(v => (
                  <div key={v.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{v.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                        <div className={`${v.bar} h-1.5 rounded-full`} style={{ width: `${v.score}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${v.tagCls}`}>{v.tag}</span>
                  </div>
                ))}
              </div>

              {/* bottom CTA */}
              <Link to="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white text-sm font-semibold py-3 rounded-2xl hover:bg-indigo-700 transition mt-2">
                Open Dashboard <ArrowRight size={15} />
              </Link>
            </div>

            {/* floating badge — top left */}
            <div className="absolute -top-5 -left-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none">Cost Savings</p>
                <p className="text-sm font-bold text-gray-800">↑ 35% this quarter</p>
              </div>
            </div>

            {/* floating badge — bottom right */}
            <div className="absolute -bottom-5 -right-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Award size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none">Scorecards</p>
                <p className="text-sm font-bold text-gray-800">Auto-updated</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">
                  <CountUp end={s.end} format={s.format} />
                </p>
                <p className="text-sm text-indigo-200 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              Everything Your Procurement Team Needs
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              From vendor onboarding to scorecard generation — the entire procurement intelligence lifecycle in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              Up and Running in 4 Simple Steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              No complex setup. No IT team required. Go from zero to full procurement intelligence in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-indigo-200 z-10" />
                )}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-black text-indigo-100">{s.step}</span>
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <s.icon size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT SPLIT — Scorecards ──────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* text */}
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Vendor Scorecards</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-5">
                Know Exactly Which Vendors Deserve Your Business
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Our automated scoring engine weighs delivery, quality, pricing competitiveness, and responsiveness
                to classify every vendor as <strong className="text-emerald-600">Preferred</strong>,{' '}
                <strong className="text-amber-600">Regular</strong>, or{' '}
                <strong className="text-rose-600">Monitor</strong> — updated after every transaction.
              </p>
              <ul className="space-y-3 mb-8">
                {['Weighted KPI formula — fully customizable', 'Real-time scorecard refresh after every order', 'Drill-down into any KPI metric per vendor', 'Export scorecards as PDF for vendor reviews'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/scorecard" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-700 transition shadow-md">
                View Scorecards <ArrowRight size={16} />
              </Link>
            </div>

            {/* mock scorecard visual */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Sample Scorecard</p>
              {[
                { name: 'AlphaTech Supplies', score: 94, tag: 'Preferred', color: 'bg-emerald-500', bar: 'bg-emerald-400', pct: '94%' },
                { name: 'BlueOcean Materials', score: 78, tag: 'Regular', color: 'bg-amber-500', bar: 'bg-amber-400', pct: '78%' },
                { name: 'FastTrack Logistics', score: 81, tag: 'Regular', color: 'bg-amber-500', bar: 'bg-amber-400', pct: '81%' },
                { name: 'CheapBulk Co.', score: 42, tag: 'Monitor', color: 'bg-rose-500', bar: 'bg-rose-400', pct: '42%' },
              ].map(v => (
                <div key={v.name} className="bg-white rounded-xl p-4 mb-3 shadow-sm flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full ${v.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {v.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{v.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div className={`${v.bar} h-1.5 rounded-full`} style={{ width: v.pct }} />
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0
                    ${v.tag === 'Preferred' ? 'bg-emerald-100 text-emerald-700' : v.tag === 'Regular' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {v.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT SPLIT — Analytics ───────────────────── */}
      <section className="bg-linear-to-br from-gray-50 to-indigo-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* mock analytics visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Spend YTD', value: '₹4.2 Cr', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Active Vendors', value: '128', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Open RFQs', value: '34', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Savings This Month', value: '₹18.4 L', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Preferred Vendors', value: '47', icon: Star, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Avg. Score', value: '79 / 100', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-white">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon size={18} className={card.color} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                  <p className={`text-xl font-extrabold mt-0.5 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* text */}
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Vendor Intelligence</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-5">
                Data-Driven Procurement Starts Here
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Stop guessing. Use real procurement data to identify savings opportunities, flag underperforming vendors,
                and make confident category decisions backed by analytics.
              </p>
              <ul className="space-y-3 mb-8">
                {['Spend analytics by category, vendor & period', 'Price trend tracking across RFQ history', 'Vendor contribution & dependency analysis', 'Procurement efficiency & cycle-time reports'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/analytics" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-700 transition shadow-md">
                Explore Analytics <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS LIST ─────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Why Teams Choose VMS</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
              Built for Real Procurement Challenges
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(b => (
              <div key={b.text} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <b.icon size={18} className="text-white" />
                </div>
                <p className="text-gray-700 font-medium leading-snug">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR CATEGORIES ─────────────────────────────── */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Vendor Categories</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              Manage Every Procurement Category
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Pre-configured categories to get you started. Add unlimited custom categories to match your business.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                  <Globe size={16} className="text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-800">{c.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Customer Stories</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
              Trusted by Procurement Leaders
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col">
                <p className="text-gray-700 leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Transform Your Vendor Management?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Join hundreds of procurement teams who have reduced costs, improved vendor quality, and reclaimed hours every week.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-full hover:bg-indigo-50 shadow-xl transition text-lg"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition text-lg"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="text-indigo-300 text-sm mt-8">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <p className="text-2xl font-extrabold text-white mb-3">VMS.</p>
              <p className="text-sm leading-relaxed">Vendor Management & Intelligence Platform for modern procurement teams.</p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Dashboard', 'Vendors', 'Analytics'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { heading: 'Support', links: ['Documentation', 'API Reference', 'Contact', 'Status'] },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-white font-semibold mb-4">{col.heading}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 VMS. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
