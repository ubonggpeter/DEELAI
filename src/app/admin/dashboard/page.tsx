"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, CreditCard, Network, Globe2, Settings,
  ShieldCheck, LogOut, LayoutDashboard, Search, Loader2,
  ChevronDown, CheckCircle2, XCircle, Clock, AlertCircle,
  Trash2, Edit2, Plus, X, Save, RefreshCw, Menu, UserCheck,
  TrendingUp, DollarSign, CheckSquare, BarChart3,
} from "lucide-react";
import { ALL_PERMISSIONS, PERMISSION_LABELS, ADMIN_REGIONS, type Permission } from "@/lib/adminConfig";

/* ─── Types (mirrors adminStore) ─────────────────────────────────── */
interface AdminInfo {
  email: string;
  isSuperAdmin: boolean;
  permissions: Permission[];
  region: string;
}
interface Stats {
  totalUsers: number; activeUsers: number; suspendedUsers: number; permanentStaff: number;
  totalJobs: number; approvedJobs: number; pendingJobs: number; rejectedJobs: number;
  totalSalaryPaid: number; pendingPayouts: number;
  totalReferrals: number; activeReferrals: number; totalSubAdmins: number;
}
interface AdminUser {
  id: string; email: string; name: string; level: string; salary: number;
  jobsDone: number; accuracy: number; streak: number; tier: string;
  status: "Active" | "Suspended"; joinedAt: string; country: string;
}
interface Job {
  id: string; userId: string; userName: string; type: string; batchId: string;
  status: "Approved" | "Pending" | "Rejected"; earnings: number;
  submittedAt: string; accuracy: number;
}
interface Payment {
  id: string; userId: string; userName: string; amount: number;
  method: string; status: "Paid" | "Pending" | "Processing"; date: string; ref: string;
}
interface Referral {
  id: string; referrerId: string; referrerName: string; recruitName: string;
  recruitEmail: string; status: "Training" | "Active" | "Inactive";
  bonusEarned: number; joinedAt: string;
}
interface SubAdmin {
  id: string; email: string; name: string; region: string;
  permissions: Permission[]; createdAt: string; createdBy: string;
}
interface PlatformSettings {
  registrationOpen: boolean; maintenanceMode: boolean;
  payoutsEnabled: boolean; newJobsEnabled: boolean; announcement: string;
}

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
  bg:   "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  b1:   "#1E2A42", b2: "#253250", cyan: "#00D4FF", green: "#00E5A0",
  gold: "#FFB800", red: "#FF4D6D", purple: "#8B5CF6",
  txt:  "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

/* ─── Tabs ───────────────────────────────────────────────────────── */
type TabId = "overview"|"users"|"jobs"|"payments"|"referrals"|"settings"|"subadmins";
const ALL_TABS: { id: TabId; label: string; icon: React.ElementType; perm?: Permission }[] = [
  { id: "overview",   label: "Overview",    icon: LayoutDashboard },
  { id: "users",      label: "Users",       icon: Users,           perm: "manage_users" },
  { id: "jobs",       label: "Jobs",        icon: Briefcase,       perm: "manage_jobs" },
  { id: "payments",   label: "Payments",    icon: CreditCard,      perm: "manage_payments" },
  { id: "referrals",  label: "Referrals",   icon: Network,         perm: "manage_referrals" },
  { id: "settings",   label: "Settings",    icon: Settings },
  { id: "subadmins",  label: "Sub-Admins",  icon: ShieldCheck },
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAdmin) { router.push("/admin/login"); return; }
        setAdminInfo(d);
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const canSeeTab = useCallback((t: typeof ALL_TABS[0]) => {
    if (!adminInfo) return false;
    if (adminInfo.isSuperAdmin) return true;
    if (!t.perm) return t.id !== "subadmins"; // sub-admins tab = super admin only
    return adminInfo.permissions.includes(t.perm);
  }, [adminInfo]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Loader2 size={32} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (!adminInfo) return null;

  const visibleTabs = ALL_TABS.filter(canSeeTab);

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, overflow:"hidden" }}>
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position:"fixed", inset:0, background:"#000a", zIndex:40 }}
          />
        )}
        <aside style={{
          position: "fixed", top:0, left:0, bottom:0, zIndex:50,
          width: "240px",
          background: C.s1,
          borderRight: `1px solid ${C.s3}`,
          display: "flex", flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
          className="admin-sidebar"
        >
          {/* Header */}
          <div style={{ padding:"20px 16px 16px", borderBottom:`1px solid ${C.s3}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:"linear-gradient(135deg,#00D4FF22,#00D4FF11)",
                border:`1px solid ${C.cyan}33`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <ShieldCheck size={16} color={C.cyan} />
              </div>
              <span style={{ color:C.txt, fontWeight:700, fontSize:"15px" }}>DEELAI Admin</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", padding:2 }}
                className="md-hidden"
              >
                <X size={16} color={C.txt2} />
              </button>
            </div>
            <div style={{
              background:C.s2, borderRadius:8, padding:"8px 10px",
              border:`1px solid ${C.s3}`,
            }}>
              <div style={{ color:C.txt, fontSize:"12px", fontWeight:600, lineHeight:1.3 }}>
                {adminInfo.email}
              </div>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:4, marginTop:4,
                background: adminInfo.isSuperAdmin ? "#00D4FF15" : "#8B5CF615",
                borderRadius:4, padding:"2px 6px",
              }}>
                <ShieldCheck size={10} color={adminInfo.isSuperAdmin ? C.cyan : C.purple} />
                <span style={{ color: adminInfo.isSuperAdmin ? C.cyan : C.purple, fontSize:"10px", fontWeight:700 }}>
                  {adminInfo.isSuperAdmin ? "SUPER ADMIN" : "SUB-ADMIN"}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
            {visibleTabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:10,
                    padding:"9px 10px", borderRadius:8, marginBottom:2,
                    background: active ? `${C.cyan}18` : "transparent",
                    border: active ? `1px solid ${C.cyan}30` : "1px solid transparent",
                    cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                  }}
                >
                  <Icon size={16} color={active ? C.cyan : C.txt2} />
                  <span style={{ color: active ? C.cyan : C.txt2, fontSize:"13px", fontWeight: active ? 600 : 400 }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding:"12px 8px", borderTop:`1px solid ${C.s3}` }}>
            <button
              onClick={() => router.push("/")}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"9px 10px", borderRadius:8, background:"transparent",
                border:"1px solid transparent", cursor:"pointer", marginBottom:4,
              }}
            >
              <Globe2 size={16} color={C.txt3} />
              <span style={{ color:C.txt3, fontSize:"13px" }}>Back to App</span>
            </button>
            <button
              onClick={logout}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"9px 10px", borderRadius:8, background:"transparent",
                border:"1px solid transparent", cursor:"pointer",
              }}
            >
              <LogOut size={16} color={C.red} />
              <span style={{ color:C.red, fontSize:"13px" }}>Logout</span>
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{
          background:C.s1, borderBottom:`1px solid ${C.s3}`,
          padding:"12px 20px", display:"flex", alignItems:"center", gap:12,
          position:"sticky", top:0, zIndex:10,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}
          >
            <Menu size={20} color={C.txt2} />
          </button>
          <h2 style={{ color:C.txt, fontSize:"16px", fontWeight:700, margin:0 }}>
            {ALL_TABS.find((t) => t.id === tab)?.label ?? "Admin"}
          </h2>
          {!adminInfo.isSuperAdmin && adminInfo.region && (
            <span style={{
              marginLeft:"auto", background:C.s3, borderRadius:6,
              padding:"3px 8px", color:C.txt2, fontSize:"11px",
            }}>
              Region: {adminInfo.region}
            </span>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex:1, padding:"20px", maxWidth:"1400px", width:"100%", margin:"0 auto" }}>
          {tab === "overview"  && <OverviewTab />}
          {tab === "users"     && <UsersTab />}
          {tab === "jobs"      && <JobsTab />}
          {tab === "payments"  && <PaymentsTab />}
          {tab === "referrals" && <ReferralsTab />}
          {tab === "settings"  && <SettingsTab isSuperAdmin={adminInfo.isSuperAdmin} />}
          {tab === "subadmins" && adminInfo.isSuperAdmin && <SubAdminsTab />}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .admin-sidebar { box-shadow: 4px 0 24px #000a; }
        @media (min-width: 768px) {
          .admin-sidebar { transform: translateX(0) !important; position: relative !important; }
          .md-hidden { display: none !important; }
          main { margin-left: 240px; }
        }
        button:focus-visible { outline: 2px solid #00D4FF55; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #162035; border-radius: 4px; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* OVERVIEW TAB                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <ErrorMsg msg="Failed to load stats" />;

  const cards = [
    { label:"Total Users",     value: stats.totalUsers,                    icon: Users,        color: C.cyan,   sub: `${stats.activeUsers} active` },
    { label:"Jobs Processed",  value: stats.totalJobs,                     icon: CheckSquare,  color: C.green,  sub: `${stats.pendingJobs} pending` },
    { label:"Total Paid Out",  value: `$${stats.totalSalaryPaid.toLocaleString()}`, icon: DollarSign, color: C.gold, sub: `$${stats.pendingPayouts.toLocaleString()} pending` },
    { label:"Active Recruits", value: stats.activeReferrals,               icon: Network,      color: C.purple, sub: `${stats.totalReferrals} total` },
    { label:"Permanent Staff", value: stats.permanentStaff,                icon: UserCheck,    color: C.cyan,   sub: `${stats.suspendedUsers} suspended` },
    { label:"Approved Jobs",   value: stats.approvedJobs,                  icon: TrendingUp,   color: C.green,  sub: `${stats.rejectedJobs} rejected` },
    { label:"Pending Payouts", value: `$${stats.pendingPayouts.toLocaleString()}`, icon: CreditCard, color: C.gold, sub: "awaiting release" },
    { label:"Sub-Admins",      value: stats.totalSubAdmins,                icon: ShieldCheck,  color: C.purple, sub: "active admins" },
  ];

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <SectionTitle title="Platform Overview" sub="Real-time stats across all DEELAI operations" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:24 }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{
              background:C.s1, border:`1px solid ${C.s3}`, borderRadius:12, padding:"16px",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ color:C.txt2, fontSize:"12px", fontWeight:500 }}>{c.label}</span>
                <div style={{
                  width:28, height:28, borderRadius:7,
                  background:`${c.color}15`, border:`1px solid ${c.color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Icon size={14} color={c.color} />
                </div>
              </div>
              <div style={{ color:C.txt, fontSize:"22px", fontWeight:700 }}>{c.value}</div>
              <div style={{ color:C.txt3, fontSize:"11px", marginTop:4 }}>{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Job distribution */}
      <div style={{
        background:C.s1, border:`1px solid ${C.s3}`, borderRadius:12, padding:20, marginBottom:16,
      }}>
        <h3 style={{ color:C.txt, fontSize:"14px", fontWeight:600, margin:"0 0 16px" }}>
          <BarChart3 size={14} style={{ display:"inline", marginRight:6 }} color={C.cyan} />
          Job Distribution
        </h3>
        {[
          { label:"Approved", count: stats.approvedJobs, total: stats.totalJobs, color: C.green },
          { label:"Pending",  count: stats.pendingJobs,  total: stats.totalJobs, color: C.gold },
          { label:"Rejected", count: stats.rejectedJobs, total: stats.totalJobs, color: C.red },
        ].map((r) => (
          <div key={r.label} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:C.txt2, fontSize:"12px" }}>{r.label}</span>
              <span style={{ color:C.txt, fontSize:"12px", fontWeight:600 }}>
                {r.count} / {r.total}
              </span>
            </div>
            <div style={{ background:C.s3, borderRadius:4, height:6, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:4, background:r.color,
                width: r.total ? `${(r.count/r.total)*100}%` : "0%",
                transition:"width 0.6s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* USERS TAB                                                           */
/* ═══════════════════════════════════════════════════════════════════ */
function UsersTab() {
  const [users, setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState("");
  const [tier, setTier]     = useState("");
  const [status, setStatus] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query)  params.set("q", query);
    if (tier)   params.set("tier", tier);
    if (status) params.set("status", status);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, [query, tier, status]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function toggleStatus(id: string, current: string) {
    setActioning(id);
    const action = current === "Active" ? "suspend" : "activate";
    await fetch("/api/admin/users", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ id, action }),
    });
    await loadUsers();
    setActioning(null);
  }

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <SectionTitle title="User Management" sub={`${users.length} users`} />

      {/* Filters */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search name or email…" />
        <Select value={tier}   onChange={setTier}   options={[{v:"",l:"All Tiers"},{v:"Permanent",l:"Permanent"},{v:"Associate",l:"Associate"}]} />
        <Select value={status} onChange={setStatus} options={[{v:"",l:"All Status"},{v:"Active",l:"Active"},{v:"Suspended",l:"Suspended"}]} />
        <RefreshBtn onClick={loadUsers} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.s3}` }}>
                {["Name","Email","Level","Salary","Jobs","Accuracy","Status","Actions"].map((h) => (
                  <th key={h} style={{ color:C.txt3, fontWeight:600, fontSize:"11px", textAlign:"left", padding:"6px 8px", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom:`1px solid ${C.s3}22` }}>
                  <td style={{ padding:"8px 8px", color:C.txt, fontWeight:500 }}>{u.name}</td>
                  <td style={{ padding:"8px 8px", color:C.txt2 }}>{u.email}</td>
                  <td style={{ padding:"8px 8px" }}>
                    <span style={{
                      fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:4,
                      background: u.tier==="Permanent" ? "#00D4FF15" : "#8B5CF615",
                      color: u.tier==="Permanent" ? C.cyan : C.purple,
                    }}>
                      {u.tier === "Permanent" ? "PERMANENT" : "ASSOCIATE"}
                    </span>
                  </td>
                  <td style={{ padding:"8px 8px", color:C.gold, fontWeight:600 }}>
                    ${u.salary.toLocaleString()}
                  </td>
                  <td style={{ padding:"8px 8px", color:C.txt2 }}>{u.jobsDone}</td>
                  <td style={{ padding:"8px 8px", color:u.accuracy>=97 ? C.green : u.accuracy>=90 ? C.gold : C.red }}>
                    {u.accuracy}%
                  </td>
                  <td style={{ padding:"8px 8px" }}>
                    <StatusPill status={u.status} />
                  </td>
                  <td style={{ padding:"8px 8px" }}>
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      disabled={actioning === u.id}
                      style={{
                        background: u.status==="Active" ? "#FF4D6D15" : "#00E5A015",
                        color: u.status==="Active" ? C.red : C.green,
                        border:`1px solid ${u.status==="Active" ? C.red : C.green}33`,
                        borderRadius:6, padding:"3px 8px", fontSize:"11px", fontWeight:600,
                        cursor:"pointer", whiteSpace:"nowrap",
                      }}
                    >
                      {actioning===u.id ? "…" : u.status==="Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <EmptyState msg="No users found" />}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* JOBS TAB                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
function JobsTab() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    fetch(`/api/admin/jobs?${p}`).then((r) => r.json()).then((d) => setJobs(d.jobs ?? [])).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function setJobStatus(id: string, newStatus: string) {
    setActioning(id);
    await fetch("/api/admin/jobs", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, status: newStatus }),
    });
    await load();
    setActioning(null);
  }

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <SectionTitle title="Job Management" sub={`${jobs.length} submissions`} />
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
        <Select value={status} onChange={setStatus} options={[
          {v:"",l:"All Status"},{v:"Approved",l:"Approved"},{v:"Pending",l:"Pending"},{v:"Rejected",l:"Rejected"},
        ]} />
        <RefreshBtn onClick={load} />
      </div>
      {loading ? <Spinner /> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.s3}` }}>
                {["Batch","User","Type","Submitted","Accuracy","Earnings","Status","Actions"].map((h) => (
                  <th key={h} style={{ color:C.txt3, fontWeight:600, fontSize:"11px", textAlign:"left", padding:"6px 8px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} style={{ borderBottom:`1px solid ${C.s3}22` }}>
                  <td style={{ padding:"8px 8px", color:C.cyan, fontWeight:600, fontFamily:"monospace" }}>{j.batchId}</td>
                  <td style={{ padding:"8px 8px", color:C.txt }}>{j.userName}</td>
                  <td style={{ padding:"8px 8px", color:C.txt2, fontSize:"12px" }}>{j.type}</td>
                  <td style={{ padding:"8px 8px", color:C.txt3, fontSize:"11px" }}>
                    {new Date(j.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding:"8px 8px", color: j.accuracy>=97 ? C.green : j.accuracy===0 ? C.txt3 : C.gold }}>
                    {j.accuracy ? `${j.accuracy}%` : "—"}
                  </td>
                  <td style={{ padding:"8px 8px", color:C.gold, fontWeight:600 }}>
                    {j.earnings ? `$${j.earnings}` : "—"}
                  </td>
                  <td style={{ padding:"8px 8px" }}><JobStatusPill status={j.status} /></td>
                  <td style={{ padding:"8px 8px", display:"flex", gap:4 }}>
                    {j.status !== "Approved" && (
                      <ActionBtn label="Approve" color={C.green} disabled={actioning===j.id} onClick={() => setJobStatus(j.id,"Approved")} />
                    )}
                    {j.status !== "Rejected" && (
                      <ActionBtn label="Reject"  color={C.red}   disabled={actioning===j.id} onClick={() => setJobStatus(j.id,"Rejected")} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && <EmptyState msg="No jobs found" />}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* PAYMENTS TAB                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    fetch(`/api/admin/payments?${p}`).then((r) => r.json()).then((d) => setPayments(d.payments ?? [])).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function markPaid(id: string) {
    setActioning(id);
    await fetch("/api/admin/payments", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, status: "Paid" }),
    });
    await load();
    setActioning(null);
  }

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <SectionTitle title="Payment Management" sub={`${payments.length} transactions · $${total.toLocaleString()} total`} />
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
        <Select value={status} onChange={setStatus} options={[
          {v:"",l:"All Status"},{v:"Paid",l:"Paid"},{v:"Pending",l:"Pending"},{v:"Processing",l:"Processing"},
        ]} />
        <RefreshBtn onClick={load} />
      </div>
      {loading ? <Spinner /> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.s3}` }}>
                {["Ref","User","Amount","Method","Date","Status","Actions"].map((h) => (
                  <th key={h} style={{ color:C.txt3, fontWeight:600, fontSize:"11px", textAlign:"left", padding:"6px 8px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.s3}22` }}>
                  <td style={{ padding:"8px 8px", color:C.txt3, fontFamily:"monospace", fontSize:"11px" }}>{p.ref}</td>
                  <td style={{ padding:"8px 8px", color:C.txt, fontWeight:500 }}>{p.userName}</td>
                  <td style={{ padding:"8px 8px", color:C.gold, fontWeight:700, fontSize:"14px" }}>
                    ${p.amount.toLocaleString()}
                  </td>
                  <td style={{ padding:"8px 8px", color:C.txt2 }}>{p.method}</td>
                  <td style={{ padding:"8px 8px", color:C.txt3 }}>{p.date}</td>
                  <td style={{ padding:"8px 8px" }}><PayStatusPill status={p.status} /></td>
                  <td style={{ padding:"8px 8px" }}>
                    {p.status !== "Paid" && (
                      <ActionBtn label="Mark Paid" color={C.green} disabled={actioning===p.id} onClick={() => markPaid(p.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <EmptyState msg="No payments found" />}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* REFERRALS TAB                                                       */
/* ═══════════════════════════════════════════════════════════════════ */
function ReferralsTab() {
  const [refs, setRefs]     = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/referrals").then((r) => r.json()).then((d) => setRefs(d.referrals ?? [])).finally(() => setLoading(false));
  }, []);

  const totalBonus = refs.reduce((s, r) => s + r.bonusEarned, 0);

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <SectionTitle title="Referral Network" sub={`${refs.length} referrals · $${totalBonus} in bonuses`} />
      {loading ? <Spinner /> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.s3}` }}>
                {["Referrer","Recruit","Recruit Email","Status","Bonus Earned","Joined"].map((h) => (
                  <th key={h} style={{ color:C.txt3, fontWeight:600, fontSize:"11px", textAlign:"left", padding:"6px 8px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refs.map((r) => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.s3}22` }}>
                  <td style={{ padding:"8px 8px", color:C.txt, fontWeight:500 }}>{r.referrerName}</td>
                  <td style={{ padding:"8px 8px", color:C.txt }}>{r.recruitName}</td>
                  <td style={{ padding:"8px 8px", color:C.txt2 }}>{r.recruitEmail}</td>
                  <td style={{ padding:"8px 8px" }}>
                    <span style={{
                      fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:4,
                      background: r.status==="Active" ? "#00E5A015" : r.status==="Training" ? "#FFB80015" : "#FF4D6D15",
                      color: r.status==="Active" ? C.green : r.status==="Training" ? C.gold : C.red,
                    }}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding:"8px 8px", color:C.gold, fontWeight:600 }}>${r.bonusEarned}</td>
                  <td style={{ padding:"8px 8px", color:C.txt3 }}>{r.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {refs.length === 0 && <EmptyState msg="No referrals found" />}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* SETTINGS TAB                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
function SettingsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings).finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/admin/settings", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(settings),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggle(key: keyof PlatformSettings) {
    if (!settings || typeof settings[key] !== "boolean") return;
    setSettings({ ...settings, [key]: !settings[key] });
  }

  if (loading) return <Spinner />;
  if (!settings) return <ErrorMsg msg="Failed to load settings" />;

  const toggles: { key: keyof PlatformSettings; label: string; desc: string; color: string }[] = [
    { key:"registrationOpen", label:"Open Registration",  desc:"Allow new users to sign up", color:C.green },
    { key:"maintenanceMode",  label:"Maintenance Mode",   desc:"Block all user access temporarily", color:C.red },
    { key:"payoutsEnabled",   label:"Payouts Enabled",    desc:"Allow workers to request payouts", color:C.gold },
    { key:"newJobsEnabled",   label:"New Jobs Available", desc:"Release new annotation batches", color:C.cyan },
  ];

  return (
    <div style={{ animation:"fadeUp 0.3s ease", maxWidth:600 }}>
      <SectionTitle title="Platform Settings" sub={isSuperAdmin ? "Super admin controls" : "Read-only view"} />

      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
        {toggles.map((t) => (
          <div key={t.key} style={{
            background:C.s1, border:`1px solid ${C.s3}`, borderRadius:10, padding:"14px 16px",
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          }}>
            <div>
              <div style={{ color:C.txt, fontSize:"14px", fontWeight:600 }}>{t.label}</div>
              <div style={{ color:C.txt3, fontSize:"12px", marginTop:2 }}>{t.desc}</div>
            </div>
            <button
              onClick={() => isSuperAdmin && toggle(t.key)}
              style={{
                width:44, height:24, borderRadius:12, border:"none", cursor: isSuperAdmin ? "pointer" : "default",
                background: settings[t.key] ? t.color : C.s3,
                position:"relative", transition:"background 0.2s", flexShrink:0,
              }}
            >
              <span style={{
                position:"absolute", top:3, width:18, height:18, borderRadius:"50%", background:"#fff",
                left: settings[t.key] ? 23 : 3, transition:"left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Announcement */}
      <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <label style={{ color:C.txt, fontSize:"14px", fontWeight:600, display:"block", marginBottom:8 }}>
          Platform Announcement
        </label>
        <textarea
          value={settings.announcement}
          onChange={(e) => isSuperAdmin && setSettings({ ...settings, announcement: e.target.value })}
          readOnly={!isSuperAdmin}
          placeholder="Leave blank for no announcement…"
          rows={3}
          style={{
            width:"100%", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:7,
            padding:"8px 10px", color:C.txt, fontSize:"13px", resize:"vertical",
            outline:"none", fontFamily:"inherit",
          }}
        />
      </div>

      {isSuperAdmin && (
        <button
          onClick={save}
          disabled={saving || saved}
          style={{
            background: saved ? C.green : C.cyan, color:"#060A12", border:"none",
            borderRadius:8, padding:"10px 20px", fontWeight:700, fontSize:"13px",
            cursor: saving ? "wait" : "pointer", display:"flex", alignItems:"center", gap:8,
          }}
        >
          {saving ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Saving…</> :
           saved  ? <><CheckCircle2 size={14} /> Saved!</> :
                    <><Save size={14} /> Save Settings</>}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* SUB-ADMINS TAB                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
function SubAdminsTab() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<SubAdmin | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const loadSubs = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/sub-admins").then((r) => r.json()).then((d) => setSubAdmins(d.subAdmins ?? [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSubs(); }, [loadSubs]);

  async function revoke(id: string) {
    if (!confirm("Revoke this sub-admin's access?")) return;
    setDeleting(id);
    await fetch(`/api/admin/sub-admins/${id}`, { method:"DELETE" });
    await loadSubs();
    setDeleting(null);
  }

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <SectionTitle title="Sub-Admin Management" sub={`${subAdmins.length} active sub-admins`} noMargin />
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{
            background:C.cyan, color:"#060A12", border:"none", borderRadius:8,
            padding:"8px 14px", fontWeight:700, fontSize:"13px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
          }}
        >
          <Plus size={14} /> Add Sub-Admin
        </button>
      </div>

      {(showForm || editTarget) && (
        <SubAdminForm
          existing={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); loadSubs(); }}
        />
      )}

      {loading ? <Spinner /> : (
        <>
          {subAdmins.length === 0 ? (
            <EmptyState msg="No sub-admins yet. Add one to get started." />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {subAdmins.map((sa) => (
                <div key={sa.id} style={{
                  background:C.s1, border:`1px solid ${C.s3}`, borderRadius:12, padding:"14px 16px",
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ color:C.txt, fontWeight:600 }}>{sa.name}</span>
                        <span style={{
                          fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:3,
                          background:`${C.cyan}15`, color:C.cyan,
                        }}>
                          {sa.region}
                        </span>
                      </div>
                      <div style={{ color:C.txt2, fontSize:"12px", marginBottom:8 }}>{sa.email}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {sa.permissions.map((p) => (
                          <span key={p} style={{
                            fontSize:"10px", padding:"2px 7px", borderRadius:4,
                            background:`${C.purple}15`, color:C.purple, fontWeight:600,
                          }}>
                            {PERMISSION_LABELS[p]}
                          </span>
                        ))}
                        {sa.permissions.length === 0 && (
                          <span style={{ color:C.txt3, fontSize:"12px" }}>No permissions</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button
                        onClick={() => { setEditTarget(sa); setShowForm(false); }}
                        style={{
                          background:`${C.cyan}15`, border:`1px solid ${C.cyan}30`,
                          color:C.cyan, borderRadius:7, padding:"5px 10px",
                          fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                        }}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => revoke(sa.id)}
                        disabled={deleting===sa.id}
                        style={{
                          background:`${C.red}15`, border:`1px solid ${C.red}30`,
                          color:C.red, borderRadius:7, padding:"5px 10px",
                          fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                        }}
                      >
                        <Trash2 size={11} /> {deleting===sa.id ? "…" : "Revoke"}
                      </button>
                    </div>
                  </div>
                  <div style={{ color:C.txt3, fontSize:"11px", marginTop:8 }}>
                    Added {new Date(sa.createdAt).toLocaleDateString()} by {sa.createdBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Sub-admin form ─────────────────────────────────────────────── */
function SubAdminForm({
  existing, onClose, onSaved,
}: { existing: SubAdmin | null; onClose: () => void; onSaved: () => void }) {
  const [email, setEmail]       = useState(existing?.email ?? "");
  const [name,  setName]        = useState(existing?.name  ?? "");
  const [region, setRegion]     = useState(existing?.region ?? "");
  const [perms, setPerms]       = useState<Permission[]>(
    existing?.permissions ?? []
  );
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  function togglePerm(p: Permission) {
    setPerms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function save() {
    if (!email || !name || !region) { setError("All fields are required."); return; }
    setError(""); setSaving(true);
    let res: Response;
    if (existing) {
      res = await fetch(`/api/admin/sub-admins/${existing.id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ region, permissions: perms }),
      });
    } else {
      res = await fetch("/api/admin/sub-admins", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, name, region, permissions: perms }),
      });
    }
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Save failed."); return; }
    onSaved();
  }

  const inputStyle: React.CSSProperties = {
    width:"100%", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:7,
    padding:"9px 10px", color:C.txt, fontSize:"13px", outline:"none",
  };

  return (
    <div style={{
      background:C.s1, border:`1px solid ${C.b1}`, borderRadius:12,
      padding:20, marginBottom:16,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <h3 style={{ color:C.txt, fontSize:"14px", fontWeight:700, margin:0 }}>
          {existing ? "Edit Sub-Admin" : "Add Sub-Admin"}
        </h3>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}>
          <X size={16} color={C.txt2} />
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        <div>
          <label style={{ color:C.txt3, fontSize:"11px", fontWeight:600, textTransform:"uppercase", display:"block", marginBottom:4 }}>
            Email
          </label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            disabled={!!existing} placeholder="admin@example.com"
            style={{ ...inputStyle, opacity: existing ? 0.5 : 1 }}
          />
        </div>
        <div>
          <label style={{ color:C.txt3, fontSize:"11px", fontWeight:600, textTransform:"uppercase", display:"block", marginBottom:4 }}>
            Display Name
          </label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            disabled={!!existing} placeholder="Full name"
            style={{ ...inputStyle, opacity: existing ? 0.5 : 1 }}
          />
        </div>
      </div>

      {/* Region */}
      <div style={{ marginBottom:12 }}>
        <label style={{ color:C.txt3, fontSize:"11px", fontWeight:600, textTransform:"uppercase", display:"block", marginBottom:4 }}>
          Region
        </label>
        <select
          value={region} onChange={(e) => setRegion(e.target.value)}
          style={{ ...inputStyle, cursor:"pointer" }}
        >
          <option value="">Select region…</option>
          {ADMIN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Permissions */}
      <div style={{ marginBottom:14 }}>
        <label style={{ color:C.txt3, fontSize:"11px", fontWeight:600, textTransform:"uppercase", display:"block", marginBottom:8 }}>
          Permissions
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {ALL_PERMISSIONS.map((p) => (
            <label key={p} style={{
              display:"flex", alignItems:"center", gap:8, cursor:"pointer",
              background: perms.includes(p) ? `${C.purple}18` : C.s2,
              border:`1px solid ${perms.includes(p) ? C.purple+"50" : C.s3}`,
              borderRadius:7, padding:"7px 10px",
            }}>
              <input
                type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)}
                style={{ accentColor:C.purple, width:14, height:14 }}
              />
              <span style={{ color: perms.includes(p) ? C.txt : C.txt2, fontSize:"12px" }}>
                {PERMISSION_LABELS[p]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          display:"flex", gap:6, background:"#FF4D6D11", border:`1px solid ${C.red}33`,
          borderRadius:7, padding:"8px 10px", marginBottom:10,
        }}>
          <AlertCircle size={13} color={C.red} style={{ flexShrink:0 }} />
          <span style={{ color:C.red, fontSize:"12px" }}>{error}</span>
        </div>
      )}

      <div style={{ display:"flex", gap:8 }}>
        <button
          onClick={save} disabled={saving}
          style={{
            background:C.purple, color:"#fff", border:"none", borderRadius:7,
            padding:"8px 16px", fontWeight:700, fontSize:"13px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
          }}
        >
          {saving ? <><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> Saving…</> :
                    <><Save size={13} /> {existing ? "Update" : "Create Sub-Admin"}</>}
        </button>
        <button onClick={onClose} style={{
          background:C.s3, color:C.txt2, border:"none", borderRadius:7,
          padding:"8px 14px", fontSize:"13px", cursor:"pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Shared micro-components ────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <Loader2 size={24} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ display:"flex", gap:8, color:C.red, padding:16, background:`${C.red}11`, borderRadius:8 }}>
      <AlertCircle size={16} /> {msg}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign:"center", color:C.txt3, padding:"32px 16px", fontSize:"13px" }}>{msg}</div>
  );
}

function SectionTitle({ title, sub, noMargin }: { title: string; sub?: string; noMargin?: boolean }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 20 }}>
      <h2 style={{ color:C.txt, fontSize:"18px", fontWeight:700, margin:0 }}>{title}</h2>
      {sub && <p style={{ color:C.txt2, fontSize:"12px", margin:"4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position:"relative", flex:"1 1 200px" }}>
      <Search size={14} color={C.txt3} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }} />
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width:"100%", background:C.s1, border:`1px solid ${C.s3}`, borderRadius:7,
          padding:"7px 10px 7px 28px", color:C.txt, fontSize:"13px", outline:"none",
        }}
      />
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        background:C.s1, border:`1px solid ${C.s3}`, borderRadius:7,
        padding:"7px 10px", color:C.txt, fontSize:"13px", outline:"none", cursor:"pointer",
      }}
    >
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function RefreshBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background:C.s1, border:`1px solid ${C.s3}`, borderRadius:7,
      padding:"7px 10px", color:C.txt2, cursor:"pointer", display:"flex", alignItems:"center", gap:4,
    }}>
      <RefreshCw size={13} />
    </button>
  );
}

function ActionBtn({ label, color, onClick, disabled }: {
  label: string; color: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:`${color}15`, color, border:`1px solid ${color}30`,
      borderRadius:5, padding:"3px 7px", fontSize:"11px", fontWeight:600, cursor:"pointer",
    }}>
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span style={{
      fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:4,
      background: active ? "#00E5A015" : "#FF4D6D15",
      color: active ? C.green : C.red,
      display:"inline-flex", alignItems:"center", gap:3,
    }}>
      {active ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
      {status.toUpperCase()}
    </span>
  );
}

function JobStatusPill({ status }: { status: string }) {
  const colors = { Approved: C.green, Pending: C.gold, Rejected: C.red };
  const icons  = { Approved: CheckCircle2, Pending: Clock, Rejected: XCircle };
  const color = colors[status as keyof typeof colors] ?? C.txt2;
  const Icon  = icons[status as keyof typeof icons]  ?? Clock;
  return (
    <span style={{
      fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:4,
      background:`${color}15`, color,
      display:"inline-flex", alignItems:"center", gap:3,
    }}>
      <Icon size={9} /> {status.toUpperCase()}
    </span>
  );
}

function PayStatusPill({ status }: { status: string }) {
  const c = status === "Paid" ? C.green : status === "Processing" ? C.cyan : C.gold;
  return (
    <span style={{
      fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:4,
      background:`${c}15`, color: c,
    }}>
      {status.toUpperCase()}
    </span>
  );
}
