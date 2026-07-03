"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Search, Filter, Download, Trash2,
  LogIn, Briefcase, User, Landmark, KeyRound, Image as ImageIcon,
  AlertCircle, ChevronDown, Loader2, XCircle, CheckCircle,
} from "lucide-react";

interface Log {
  id: string;
  type: string;
  title: string;
  detail: string;
  amount: number | null;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "All Activity" },
  { value: "login", label: "Sign-ins" },
  { value: "job_submitted", label: "Jobs Submitted" },
  { value: "job_rejected", label: "Jobs Rejected" },
  { value: "profile_changed", label: "Profile Changes" },
  { value: "bank_saved", label: "Bank Linked" },
  { value: "password_changed", label: "Password Changes" },
  { value: "avatar_uploaded", label: "Photo Updated" },
];

const TYPE_ICON: Record<string, React.ElementType> = {
  login: LogIn,
  job_submitted: Briefcase,
  job_rejected: Briefcase,
  profile_changed: User,
  bank_saved: Landmark,
  password_changed: KeyRound,
  avatar_uploaded: ImageIcon,
};

const TYPE_COLOR: Record<string, string> = {
  login: "#00D4FF",
  job_submitted: "#00E5A0",
  job_rejected: "#FF4D6D",
  profile_changed: "#8B5CF6",
  bank_saved: "#F59E0B",
  password_changed: "#F97316",
  avatar_uploaded: "#EC4899",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryScreen({ onBack }: { onBack: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const LIMIT = 30;

  const fetch = useCallback(async (s: string, t: string, off: number, append: boolean) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
    if (s) params.set("search", s);
    if (t) params.set("type", t);
    const res = await window.fetch(`/api/auth/activity?${params}`);
    const data = await res.json() as { logs: Log[]; total: number };
    setLogs(prev => append ? [...prev, ...data.logs] : data.logs);
    setTotal(data.total);
    setLoading(false);
  }, []);

  useEffect(() => {
    setOffset(0);
    fetch(search, typeFilter, 0, false);
  }, [search, typeFilter, fetch]);

  const loadMore = () => {
    const nextOff = offset + LIMIT;
    setOffset(nextOff);
    fetch(search, typeFilter, nextOff, true);
  };

  const clearHistory = async () => {
    setClearing(true);
    await window.fetch("/api/auth/activity", { method: "DELETE" });
    setLogs([]);
    setTotal(0);
    setClearing(false);
    setConfirmClear(false);
  };

  const downloadCSV = async () => {
    setExporting(true);
    const res = await window.fetch("/api/auth/activity/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deelai-activity-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const C = {
    bg: "#080E1A",
    card: "#0C1422",
    b1: "rgba(255,255,255,.06)",
    b2: "rgba(255,255,255,.1)",
    txt1: "#E8EDF5",
    txt2: "rgba(232,237,245,.55)",
    txt3: "rgba(232,237,245,.32)",
  };

  const selectedTypeLabel = TYPE_OPTIONS.find(o => o.value === typeFilter)?.label ?? "All Activity";

  return (
    <div className="flex flex-col h-full" style={{ background: C.bg, color: C.txt1, minHeight: "100vh" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-10 pb-4" style={{ background: C.bg, borderBottom: `1px solid ${C.b1}` }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-xl" style={{ background: C.card, border: `1px solid ${C.b2}` }}>
            <ArrowLeft size={18} color={C.txt2} />
          </button>
          <h1 className="font-bold text-[18px] flex-1" style={{ fontFamily: "system-ui,sans-serif" }}>Activity History</h1>
          <button onClick={downloadCSV} disabled={exporting || logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: "rgba(0,229,160,.12)", border: "1px solid rgba(0,229,160,.25)", color: "#00E5A0" }}>
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            CSV
          </button>
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{ background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.25)", color: "#FF4D6D" }}>
              <Trash2 size={13} />
              Clear
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button onClick={clearHistory} disabled={clearing}
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                style={{ background: "#FF4D6D", color: "#fff" }}>
                {clearing ? <Loader2 size={13} className="animate-spin" /> : "Confirm"}
              </button>
              <button onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl text-[12px]"
                style={{ background: C.card, border: `1px solid ${C.b2}`, color: C.txt2 }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Search + filter row */}
        <div className="flex gap-2">
          <div className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
            style={{ background: C.card, border: `1px solid ${C.b2}` }}>
            <Search size={15} color={C.txt3} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search activity..." className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: C.txt1 }} />
            {search && <button onClick={() => setSearch("")}><XCircle size={14} color={C.txt3} /></button>}
          </div>
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px]"
              style={{ background: typeFilter ? "rgba(139,92,246,.15)" : C.card, border: `1px solid ${typeFilter ? "rgba(139,92,246,.4)" : C.b2}`, color: typeFilter ? "#8B5CF6" : C.txt2 }}>
              <Filter size={14} />
              {selectedTypeLabel}
              <ChevronDown size={13} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden"
                style={{ background: "#111928", border: `1px solid ${C.b2}`, minWidth: 180 }}>
                {TYPE_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => { setTypeFilter(o.value); setFilterOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px]"
                    style={{ background: typeFilter === o.value ? "rgba(139,92,246,.15)" : "transparent", color: typeFilter === o.value ? "#8B5CF6" : C.txt1 }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 text-[12px]" style={{ color: C.txt3 }}>
        {total} {total === 1 ? "event" : "events"} total
      </div>

      {/* Log items */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" color={C.txt3} />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} color={C.txt3} />
            <p className="text-[14px]" style={{ color: C.txt3 }}>No activity found</p>
          </div>
        ) : (
          <>
            {logs.map((log) => {
              const Icon = TYPE_ICON[log.type] ?? CheckCircle;
              const color = TYPE_COLOR[log.type] ?? C.txt2;
              return (
                <div key={log.id} className="flex items-start gap-3 py-3.5"
                  style={{ borderBottom: `1px solid ${C.b1}` }}>
                  <div className="mt-0.5 rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: 36, height: 36, background: `${color}14`, border: `1px solid ${color}30` }}>
                    <Icon size={17} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-semibold leading-tight" style={{ color: C.txt1 }}>{log.title}</p>
                      {log.amount != null && (
                        <span className="text-[13px] font-bold shrink-0" style={{ color: "#00E5A0" }}>+${log.amount.toFixed(2)}</span>
                      )}
                    </div>
                    {log.detail && (
                      <p className="text-[12px] mt-0.5 truncate" style={{ color: C.txt2 }}>{log.detail}</p>
                    )}
                    <p className="text-[11px] mt-1" style={{ color: C.txt3 }}>{formatTime(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {logs.length < total && (
              <button onClick={loadMore} disabled={loading}
                className="w-full py-3 mt-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2"
                style={{ background: C.card, border: `1px solid ${C.b2}`, color: C.txt2 }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
