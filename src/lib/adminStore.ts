/**
 * Server-side in-memory store.
 * In production this would be a real database (Postgres/Supabase).
 * Data persists for the lifetime of the Node.js server process.
 */
import { SUPER_ADMIN_EMAIL, type Permission } from "./adminConfig";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface SubAdmin {
  id: string;
  email: string;
  name: string;
  region: string;
  permissions: Permission[];
  createdAt: string;
  createdBy: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  level: string;
  salary: number;
  jobsDone: number;
  accuracy: number;
  streak: number;
  tier: "Permanent" | "Associate";
  status: "Active" | "Suspended";
  joinedAt: string;
  country: string;
  is_admin: boolean;
  is_super_admin: boolean;
  admin_permissions: Permission[];
  admin_region: string | null;
}

export interface Job {
  id: string;
  userId: string;
  userName: string;
  type: "Image Annotation" | "Voice Transcription" | "Content Intelligence";
  batchId: string;
  status: "Approved" | "Pending" | "Rejected";
  earnings: number;
  submittedAt: string;
  accuracy: number;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: "Bank Transfer" | "USDT / Crypto" | "PayPal";
  status: "Paid" | "Pending" | "Processing";
  date: string;
  ref: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  recruitName: string;
  recruitEmail: string;
  status: "Training" | "Active" | "Inactive";
  bonusEarned: number;
  joinedAt: string;
}

export interface PlatformSettings {
  registrationOpen: boolean;
  maintenanceMode: boolean;
  payoutsEnabled: boolean;
  newJobsEnabled: boolean;
  announcement: string;
}

/* ── Seed data ──────────────────────────────────────────────────────── */
const seedUsers: AdminUser[] = [
  { id:"u1", email:"chidi@deelai.uk",    name:"Chidi Okonkwo",  level:"PERMANENT STAFF", salary:18420, jobsDone:1241, accuracy:98.7, streak:42, tier:"Permanent", status:"Active", joinedAt:"2025-11-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u2", email:"aisha@deelai.uk",    name:"Aisha Mensah",   level:"PERMANENT STAFF", salary:16800, jobsDone:1102, accuracy:98.2, streak:35, tier:"Permanent", status:"Active", joinedAt:"2025-11-14", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u3", email:"kwame@deelai.uk",    name:"Kwame Asante",   level:"PERMANENT STAFF", salary:15990, jobsDone:1044, accuracy:97.9, streak:28, tier:"Permanent", status:"Active", joinedAt:"2025-11-20", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u4", email:"amara@deelai.uk",    name:"Amara Osei",     level:"ASSOCIATE STAFF", salary:14750, jobsDone:984,  accuracy:97.4, streak:21, tier:"Associate", status:"Active", joinedAt:"2025-12-01", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u5", email:"fatima@deelai.uk",   name:"Fatima Bello",   level:"ASSOCIATE STAFF", salary:13200, jobsDone:901,  accuracy:96.8, streak:14, tier:"Associate", status:"Active", joinedAt:"2025-12-05", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u6", email:"emeka@deelai.uk",    name:"Emeka Nwosu",    level:"ASSOCIATE STAFF", salary:12800, jobsDone:876,  accuracy:96.1, streak:10, tier:"Associate", status:"Active", joinedAt:"2025-12-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u7", email:"sade@deelai.uk",     name:"Sade Williams",  level:"ASSOCIATE STAFF", salary:11500, jobsDone:820,  accuracy:95.5, streak:7,  tier:"Associate", status:"Active", joinedAt:"2025-12-15", country:"GB", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u8", email:"tunde@deelai.uk",    name:"Tunde Adeyemi",  level:"ASSOCIATE STAFF", salary:10900, jobsDone:794,  accuracy:94.9, streak:5,  tier:"Associate", status:"Active", joinedAt:"2026-01-03", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u9", email:"gideon@deelai.uk",   name:"Gideon NSE",     level:"ASSOCIATE STAFF", salary:9400,  jobsDone:620,  accuracy:93.2, streak:3,  tier:"Associate", status:"Suspended", joinedAt:"2026-01-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u10", email:"ravi@deelai.uk",    name:"Ravi Sharma",    level:"ASSOCIATE STAFF", salary:8750,  jobsDone:540,  accuracy:92.8, streak:0,  tier:"Associate", status:"Active", joinedAt:"2026-01-18", country:"IN", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null },
  { id:"u0", email:SUPER_ADMIN_EMAIL,    name:"Super Admin",    level:"SUPER ADMIN",    salary:0,    jobsDone:0,    accuracy:100,   streak:0,  tier:"Permanent", status:"Active", joinedAt:"2025-10-01", country:"NG", is_admin:true, is_super_admin:true, admin_permissions:[], admin_region:"Global" },
];

const seedJobs: Job[] = [
  { id:"j1",  userId:"u1",  userName:"Chidi Okonkwo", type:"Image Annotation",       batchId:"A-2291", status:"Approved", earnings:12.50, submittedAt:"2026-07-01T10:02:00Z", accuracy:99.1 },
  { id:"j2",  userId:"u2",  userName:"Aisha Mensah",  type:"Image Annotation",       batchId:"A-2290", status:"Approved", earnings:12.50, submittedAt:"2026-07-01T09:44:00Z", accuracy:98.7 },
  { id:"j3",  userId:"u3",  userName:"Kwame Asante",  type:"Voice Transcription",    batchId:"T-0821", status:"Pending",  earnings:18.00, submittedAt:"2026-07-01T09:10:00Z", accuracy:0 },
  { id:"j4",  userId:"u4",  userName:"Amara Osei",    type:"Image Annotation",       batchId:"A-2289", status:"Approved", earnings:12.50, submittedAt:"2026-06-30T14:22:00Z", accuracy:97.4 },
  { id:"j5",  userId:"u5",  userName:"Fatima Bello",  type:"Content Intelligence",   batchId:"C-0442", status:"Rejected", earnings:0,     submittedAt:"2026-06-30T11:55:00Z", accuracy:62.0 },
  { id:"j6",  userId:"u6",  userName:"Emeka Nwosu",   type:"Image Annotation",       batchId:"A-2288", status:"Approved", earnings:12.50, submittedAt:"2026-06-30T08:30:00Z", accuracy:96.2 },
  { id:"j7",  userId:"u7",  userName:"Sade Williams", type:"Image Annotation",       batchId:"A-2287", status:"Approved", earnings:12.50, submittedAt:"2026-06-29T16:45:00Z", accuracy:95.8 },
  { id:"j8",  userId:"u8",  userName:"Tunde Adeyemi", type:"Voice Transcription",    batchId:"T-0820", status:"Pending",  earnings:18.00, submittedAt:"2026-06-29T13:20:00Z", accuracy:0 },
  { id:"j9",  userId:"u1",  userName:"Chidi Okonkwo", type:"Image Annotation",       batchId:"A-2286", status:"Approved", earnings:12.50, submittedAt:"2026-06-29T10:05:00Z", accuracy:99.3 },
  { id:"j10", userId:"u2",  userName:"Aisha Mensah",  type:"Content Intelligence",   batchId:"C-0441", status:"Approved", earnings:9.50,  submittedAt:"2026-06-28T15:30:00Z", accuracy:98.1 },
];

const seedPayments: Payment[] = [
  { id:"p1", userId:"u1", userName:"Chidi Okonkwo", amount:18420, method:"Bank Transfer", status:"Paid",       date:"2026-05-23", ref:"TXN-83920141" },
  { id:"p2", userId:"u2", userName:"Aisha Mensah",  amount:16800, method:"USDT / Crypto", status:"Paid",       date:"2026-05-23", ref:"TXN-83920142" },
  { id:"p3", userId:"u3", userName:"Kwame Asante",  amount:15990, method:"Bank Transfer", status:"Paid",       date:"2026-05-23", ref:"TXN-83920143" },
  { id:"p4", userId:"u4", userName:"Amara Osei",    amount:14750, method:"Bank Transfer", status:"Pending",    date:"2026-06-27", ref:"TXN-83920144" },
  { id:"p5", userId:"u5", userName:"Fatima Bello",  amount:13200, method:"PayPal",        status:"Processing", date:"2026-06-27", ref:"TXN-83920145" },
  { id:"p6", userId:"u6", userName:"Emeka Nwosu",   amount:12800, method:"Bank Transfer", status:"Pending",    date:"2026-06-27", ref:"TXN-83920146" },
  { id:"p7", userId:"u7", userName:"Sade Williams", amount:11500, method:"USDT / Crypto", status:"Paid",       date:"2026-05-16", ref:"TXN-83920147" },
  { id:"p8", userId:"u8", userName:"Tunde Adeyemi", amount:10900, method:"Bank Transfer", status:"Paid",       date:"2026-05-16", ref:"TXN-83920148" },
];

const seedReferrals: Referral[] = [
  { id:"r1", referrerId:"u1", referrerName:"Chidi Okonkwo", recruitName:"Fatima Bello",  recruitEmail:"fatima@deelai.uk", status:"Active",   bonusEarned:240, joinedAt:"2025-12-05" },
  { id:"r2", referrerId:"u1", referrerName:"Chidi Okonkwo", recruitName:"Emeka Nwosu",   recruitEmail:"emeka@deelai.uk",  status:"Active",   bonusEarned:200, joinedAt:"2025-12-10" },
  { id:"r3", referrerId:"u2", referrerName:"Aisha Mensah",  recruitName:"Sade Williams", recruitEmail:"sade@deelai.uk",   status:"Active",   bonusEarned:160, joinedAt:"2025-12-15" },
  { id:"r4", referrerId:"u3", referrerName:"Kwame Asante",  recruitName:"Tunde Adeyemi", recruitEmail:"tunde@deelai.uk",  status:"Active",   bonusEarned:120, joinedAt:"2026-01-03" },
  { id:"r5", referrerId:"u4", referrerName:"Amara Osei",    recruitName:"Gideon NSE",     recruitEmail:"gideon@deelai.uk", status:"Inactive", bonusEarned:40,  joinedAt:"2026-01-10" },
  { id:"r6", referrerId:"u2", referrerName:"Aisha Mensah",  recruitName:"Ravi Sharma",   recruitEmail:"ravi@deelai.uk",   status:"Active",   bonusEarned:80,  joinedAt:"2026-01-18" },
];

/* ── Singleton store ────────────────────────────────────────────────── */
class AdminStore {
  users:       AdminUser[]        = [...seedUsers];
  jobs:        Job[]              = [...seedJobs];
  payments:    Payment[]          = [...seedPayments];
  referrals:   Referral[]         = [...seedReferrals];
  subAdmins:   SubAdmin[]         = [];
  settings:    PlatformSettings   = {
    registrationOpen:  true,
    maintenanceMode:   false,
    payoutsEnabled:    true,
    newJobsEnabled:    true,
    announcement:      "",
  };

  /* ── Auth helpers ─────────────────────────────────────────────────── */
  isAdmin(email: string): boolean {
    if (email === SUPER_ADMIN_EMAIL) return true;
    return this.subAdmins.some((s) => s.email === email);
  }

  isSuperAdmin(email: string): boolean {
    return email === SUPER_ADMIN_EMAIL;
  }

  getAdminInfo(email: string) {
    if (email === SUPER_ADMIN_EMAIL) {
      return { email, isSuperAdmin: true, permissions: [] as Permission[], region: "Global" };
    }
    const sa = this.subAdmins.find((s) => s.email === email);
    if (!sa) return null;
    return { email, isSuperAdmin: false, permissions: sa.permissions, region: sa.region };
  }

  hasPermission(email: string, perm: Permission): boolean {
    if (this.isSuperAdmin(email)) return true;
    const sa = this.subAdmins.find((s) => s.email === email);
    return sa ? sa.permissions.includes(perm) : false;
  }

  /* ── Sub-admin CRUD ───────────────────────────────────────────────── */
  createSubAdmin(data: Omit<SubAdmin, "id" | "createdAt">): SubAdmin {
    const sa: SubAdmin = {
      ...data,
      id: `sa-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.subAdmins.push(sa);
    // Update user record if exists
    const u = this.users.find((u) => u.email === data.email);
    if (u) { u.is_admin = true; u.admin_permissions = data.permissions; u.admin_region = data.region; }
    return sa;
  }

  updateSubAdmin(id: string, data: Partial<Pick<SubAdmin, "region" | "permissions">>) {
    const sa = this.subAdmins.find((s) => s.id === id);
    if (!sa) return null;
    if (data.region)      sa.region      = data.region;
    if (data.permissions) sa.permissions = data.permissions;
    const u = this.users.find((u) => u.email === sa.email);
    if (u) { u.admin_permissions = sa.permissions; u.admin_region = sa.region; }
    return sa;
  }

  deleteSubAdmin(id: string) {
    const idx = this.subAdmins.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const sa = this.subAdmins[idx];
    this.subAdmins.splice(idx, 1);
    const u = this.users.find((u) => u.email === sa.email);
    if (u) { u.is_admin = false; u.admin_permissions = []; u.admin_region = null; }
    return true;
  }

  /* ── User CRUD ────────────────────────────────────────────────────── */
  suspendUser(id: string) {
    const u = this.users.find((u) => u.id === id);
    if (u) u.status = "Suspended";
    return u ?? null;
  }

  activateUser(id: string) {
    const u = this.users.find((u) => u.id === id);
    if (u) u.status = "Active";
    return u ?? null;
  }

  /* ── Stats ────────────────────────────────────────────────────────── */
  getStats() {
    const totalSalaryPaid = this.payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const pendingPayouts  = this.payments.filter((p) => p.status === "Pending" || p.status === "Processing").reduce((s, p) => s + p.amount, 0);
    return {
      totalUsers:       this.users.filter((u) => !u.is_super_admin).length,
      activeUsers:      this.users.filter((u) => u.status === "Active" && !u.is_super_admin).length,
      suspendedUsers:   this.users.filter((u) => u.status === "Suspended").length,
      permanentStaff:   this.users.filter((u) => u.tier === "Permanent" && !u.is_super_admin).length,
      totalJobs:        this.jobs.length,
      approvedJobs:     this.jobs.filter((j) => j.status === "Approved").length,
      pendingJobs:      this.jobs.filter((j) => j.status === "Pending").length,
      rejectedJobs:     this.jobs.filter((j) => j.status === "Rejected").length,
      totalSalaryPaid,
      pendingPayouts,
      totalReferrals:   this.referrals.length,
      activeReferrals:  this.referrals.filter((r) => r.status === "Active").length,
      totalSubAdmins:   this.subAdmins.length,
    };
  }
}

// Global singleton — persists for the Node.js process lifetime
const globalForAdmin = global as typeof global & { adminStore?: AdminStore };
if (!globalForAdmin.adminStore) globalForAdmin.adminStore = new AdminStore();
export const adminStore = globalForAdmin.adminStore;
