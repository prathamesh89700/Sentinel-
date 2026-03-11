import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Activity, 
  Users, 
  AlertTriangle, 
  Database, 
  BarChart3, 
  Info,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Terminal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface ThreatActor {
  id: number;
  name: string;
  aliases: string;
  origin: string;
  motivation: string;
  techniques: string;
  target_industries: string;
  description: string;
  last_seen: string;
}

interface IOCHistory {
  id: number;
  type: string;
  value: string;
  risk_score: number;
  threat_type: string;
  last_checked: string;
}

interface Trend {
  attack_type: string;
  total: number;
}

// --- Components ---

const Card = ({ children, className, title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any, key?: React.Key }) => (
  <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden", className)}>
    {(title || Icon) && (
      <div className="px-4 py-3 border-bottom border-slate-100 flex items-center gap-2 bg-slate-50/50">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        {title && <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{title}</h3>}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'danger' | 'warning' | 'success' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", variants[variant])}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'actors' | 'analyzer' | 'docs'>('dashboard');
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [history, setHistory] = useState<IOCHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Analyzer State
  const [iocInput, setIocInput] = useState('');
  const [iocType, setIocType] = useState<'ip' | 'domain' | 'hash'>('ip');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [actorsRes, trendsRes, historyRes] = await Promise.all([
        fetch('/api/actors'),
        fetch('/api/trends'),
        fetch('/api/history')
      ]);
      setActors(await actorsRes.json());
      setTrends(await trendsRes.json());
      setHistory(await historyRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iocInput) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: iocType, value: iocInput })
      });
      const data = await res.json();
      setAnalysisResult(data);
      fetchData(); // Refresh history
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SENTINEL</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Threat Intelligence</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              activeTab === 'dashboard' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('analyzer')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              activeTab === 'analyzer' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Search className="w-4 h-4" /> IOC Analyzer
          </button>
          <button 
            onClick={() => setActiveTab('actors')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              activeTab === 'actors' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" /> Threat Actors
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              activeTab === 'docs' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <FileText className="w-4 h-4" /> Project Docs
          </button>
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && "Security Overview"}
              {activeTab === 'analyzer' && "IOC Analysis Engine"}
              {activeTab === 'actors' && "Threat Actor Intelligence"}
              {activeTab === 'docs' && "Project Documentation"}
            </h2>
            <p className="text-slate-500 mt-1">
              {activeTab === 'dashboard' && "Real-time monitoring of global threat landscape."}
              {activeTab === 'analyzer' && "Investigate suspicious indicators across multiple intelligence sources."}
              {activeTab === 'actors' && "Detailed profiles of known advanced persistent threats."}
              {activeTab === 'docs' && "Technical specifications and internship report data."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Session</p>
            <p className="text-sm font-mono text-slate-600">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Stats Row */}
              <div className="col-span-12 grid grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Actors</p>
                      <h4 className="text-2xl font-bold">{actors.length}</h4>
                    </div>
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">High Risk IOCs</p>
                      <h4 className="text-2xl font-bold">{history.filter(h => h.risk_score > 70).length}</h4>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Analyses Run</p>
                      <h4 className="text-2xl font-bold">{history.length}</h4>
                    </div>
                    <Activity className="w-5 h-5 text-emerald-500" />
                  </div>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Alerts</p>
                      <h4 className="text-2xl font-bold">12</h4>
                    </div>
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <Card className="col-span-8" title="Attack Type Distribution" icon={BarChart3}>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="attack_type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {trends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="col-span-4" title="Recent Activity" icon={Clock}>
                <div className="space-y-4 mt-4">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.risk_score > 70 ? "bg-red-500" : item.risk_score > 30 ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate text-slate-700">{item.value}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{item.type} • {item.threat_type}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{item.risk_score}%</span>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No recent activity found</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Threat Actors Preview */}
              <Card className="col-span-12" title="Featured Threat Actors" icon={Users}>
                <div className="grid grid-cols-3 gap-6 mt-4">
                  {actors.slice(0, 3).map(actor => (
                    <div key={actor.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{actor.name}</h5>
                        <Badge variant={actor.origin === 'Russia' || actor.origin === 'North Korea' ? 'danger' : 'warning'}>{actor.origin}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{actor.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {actor.techniques.split(',').slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analyzer' && (
            <motion.div 
              key="analyzer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="mb-8">
                <form onSubmit={handleAnalyze} className="space-y-6">
                  <div className="flex gap-4">
                    {(['ip', 'domain', 'hash'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setIocType(type)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                          iocType === type ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={iocInput}
                      onChange={(e) => setIocInput(e.target.value)}
                      placeholder={
                        iocType === 'ip' ? "e.g., 192.168.1.1" : 
                        iocType === 'domain' ? "e.g., malicious-site.com" : 
                        "e.g., 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
                      }
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  <button 
                    disabled={analyzing || !iocInput}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Indicator...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4" /> Run Analysis
                      </>
                    )}
                  </button>
                </form>
              </Card>

              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={cn(
                    "border-t-4",
                    analysisResult.riskScore > 70 ? "border-t-red-500" : analysisResult.riskScore > 30 ? "border-t-amber-500" : "border-t-emerald-500"
                  )}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Analysis Result</h4>
                        <p className="text-xl font-mono font-bold text-slate-900">{analysisResult.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Risk Score</p>
                        <p className={cn(
                          "text-3xl font-black",
                          analysisResult.riskScore > 70 ? "text-red-500" : analysisResult.riskScore > 30 ? "text-amber-500" : "text-emerald-500"
                        )}>{analysisResult.riskScore}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Threat Classification</span>
                        </div>
                        <p className="font-bold text-slate-900">{analysisResult.threatType}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Sources Queried</span>
                        </div>
                        <div className="flex gap-2">
                          {analysisResult.sources.map((s: string) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 text-slate-300 rounded-xl font-mono text-xs leading-relaxed">
                      <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Terminal className="w-3 h-3" />
                        <span className="uppercase font-bold tracking-widest">Detailed Logs</span>
                      </div>
                      {analysisResult.details}
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'actors' && (
            <motion.div 
              key="actors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {actors.map(actor => (
                <Card key={actor.id} className="hover:shadow-md transition-shadow">
                  <div className="flex gap-8">
                    <div className="w-48 flex-shrink-0">
                      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-12 h-12 text-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Origin</p>
                          <p className="text-sm font-semibold">{actor.origin}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Last Activity</p>
                          <p className="text-sm font-semibold">{actor.last_seen}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">{actor.name}</h3>
                          <p className="text-sm text-slate-500 italic">AKA: {actor.aliases}</p>
                        </div>
                        <Badge variant="danger">APT Group</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Motivation</h5>
                          <p className="text-sm text-slate-700">{actor.motivation}</p>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Target Industries</h5>
                          <p className="text-sm text-slate-700">{actor.target_industries}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Description</h5>
                        <p className="text-sm text-slate-600 leading-relaxed">{actor.description}</p>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Techniques (TTPs)</h5>
                        <div className="flex flex-wrap gap-2">
                          {actor.techniques.split(',').map(t => (
                            <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div 
              key="docs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-slate max-w-none"
            >
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-indigo-600" /> System Architecture
                    </h3>
                    <div className="p-6 bg-white border border-slate-200 rounded-xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm">Frontend (React + Tailwind)</div>
                        <div className="w-px h-8 bg-slate-300" />
                        <div className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">API Layer (Express.js)</div>
                        <div className="w-px h-8 bg-slate-300" />
                        <div className="flex gap-8">
                          <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-xs">SQLite Database</div>
                          <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-xs">External APIs (VT/AbuseIPDB)</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" /> Database Schema
                    </h3>
                    <div className="p-6 bg-slate-900 text-slate-300 rounded-xl font-mono text-xs overflow-x-auto">
                      <pre>{`
CREATE TABLE threat_actors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  aliases TEXT,
  origin TEXT,
  techniques TEXT,
  target_industries TEXT,
  description TEXT,
  last_seen DATE
);

CREATE TABLE ioc_history (
  id INTEGER PRIMARY KEY,
  type TEXT, -- ip, domain, hash
  value TEXT,
  risk_score INTEGER,
  threat_type TEXT,
  last_checked DATETIME
);
                      `}</pre>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" /> Use Case: SOC Analyst Workflow
                    </h3>
                    <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                        <div>
                          <p className="font-bold text-slate-900">Detection</p>
                          <p className="text-sm text-slate-600">Analyst receives an alert about a suspicious IP connecting to an internal server.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                        <div>
                          <p className="font-bold text-slate-900">Investigation</p>
                          <p className="text-sm text-slate-600">Analyst enters the IP into the <strong>IOC Analyzer</strong> to check reputation.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                        <div>
                          <p className="font-bold text-slate-900">Contextualization</p>
                          <p className="text-sm text-slate-600">Analyzer returns a 85% risk score. Analyst checks <strong>Threat Actors</strong> to see if the IP matches known APT infrastructure.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                        <div>
                          <p className="font-bold text-slate-900">Response</p>
                          <p className="text-sm text-slate-600">Analyst blocks the IP and initiates incident response protocols based on the identified threat actor techniques.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="col-span-4 space-y-6">
                  <Card title="Internship Info" icon={Info}>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Project Title</p>
                        <p className="text-sm font-semibold">Threat Intelligence & IOC Analysis Platform</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Internship Phase</p>
                        <p className="text-sm font-semibold">OJT-1 (Threat Intelligence)</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tech Stack</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['React', 'Express', 'SQLite', 'Tailwind', 'Recharts'].map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="API Integration" icon={Terminal}>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      To enable real-time data, configure the following environment variables in the AI Studio Secrets panel:
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono">VIRUSTOTAL_API_KEY</div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono">ABUSEIPDB_API_KEY</div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
