/**
 * Server-side in-memory store.
 * In production replace with Postgres/Supabase.
 * Data persists for the lifetime of the Node.js server process.
 */
import bcrypt from "bcryptjs";
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

export interface Channel {
  id: string;
  ownerEmail: string;
  channelName: string;
  description: string;
  estTime: string;
  paystackPublicKey: string;
  paystackSecretKey: string;
  referralCommissionRate: number;
  jobPassFee: number;
  isActive: boolean;
  balance: number;
  createdAt: string;
}

export interface ChannelCommission {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
}

export type PermitType    = "full-time" | "part-time";
export type AccountStatus = "pending"   | "approved"  | "rejected";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
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
  channelId?: string;
  permitType?: PermitType;
  accountStatus: AccountStatus;
  cvUrl?: string;
  jobPassPaid: boolean;
  jobPassAmount: number;
  registeredAt?: string;
}

export interface Job {
  id: string; userId: string; userName: string;
  type: "Image Annotation" | "Voice Transcription" | "Content Intelligence";
  batchId: string; status: "Approved" | "Pending" | "Rejected";
  earnings: number; submittedAt: string; accuracy: number;
}

export interface Payment {
  id: string; userId: string; userName: string; amount: number;
  method: "Bank Transfer" | "USDT / Crypto" | "PayPal";
  status: "Paid" | "Pending" | "Processing"; date: string; ref: string;
}

export interface Referral {
  id: string; referrerId: string; referrerName: string;
  recruitName: string; recruitEmail: string;
  status: "Training" | "Active" | "Inactive"; bonusEarned: number; joinedAt: string;
}

export interface PlatformSettings {
  registrationOpen: boolean; maintenanceMode: boolean;
  payoutsEnabled: boolean; newJobsEnabled: boolean; announcement: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  accountStatus: AccountStatus;
  channelId?: string;
}

/* ── Seed data ──────────────────────────────────────────────────────── */
const seedSubAdmins: SubAdmin[] = [
  { id:"sa-seed-1", email:"channel.a@deelai.uk", name:"Channel A Admin", region:"West Africa",   permissions:["manage_users","manage_jobs","manage_payments","manage_referrals","view_reports"], createdAt:"2026-01-15T10:00:00Z", createdBy:SUPER_ADMIN_EMAIL },
  { id:"sa-seed-2", email:"channel.b@deelai.uk", name:"Channel B Admin", region:"East Africa",   permissions:["manage_users","manage_jobs","view_reports"],                                      createdAt:"2026-01-20T10:00:00Z", createdBy:SUPER_ADMIN_EMAIL },
  { id:"sa-seed-3", email:"channel.c@deelai.uk", name:"Channel C Admin", region:"North America", permissions:["manage_users","manage_payments","view_reports"],                                  createdAt:"2026-02-01T10:00:00Z", createdBy:SUPER_ADMIN_EMAIL },
];

const seedChannels: Channel[] = [
  {
    id:"ch-a", ownerEmail:"channel.a@deelai.uk", channelName:"A",
    description:"Full-time positions for dedicated remote workers. Competitive pay with daily payouts and fast-track approval.",
    estTime:"2 min", paystackPublicKey:"", paystackSecretKey:"",
    referralCommissionRate:10, jobPassFee:5000, isActive:true, balance:12500,
    createdAt:"2026-01-15T10:00:00Z",
  },
  {
    id:"ch-b", ownerEmail:"channel.b@deelai.uk", channelName:"B",
    description:"Flexible part-time schedule. Perfect for students and anyone looking to earn on their own timetable.",
    estTime:"5 min", paystackPublicKey:"", paystackSecretKey:"",
    referralCommissionRate:12, jobPassFee:3500, isActive:true, balance:8400,
    createdAt:"2026-01-20T10:00:00Z",
  },
  {
    id:"ch-c", ownerEmail:"channel.c@deelai.uk", channelName:"C",
    description:"Premium channel for experienced data annotators. Higher base pay and exclusive high-value batches.",
    estTime:"10 min", paystackPublicKey:"", paystackSecretKey:"",
    referralCommissionRate:15, jobPassFee:7500, isActive:true, balance:22500,
    createdAt:"2026-02-01T10:00:00Z",
  },
];

const seedUsers: AdminUser[] = [
  { id:"u1",  email:"chidi@deelai.uk",  phone:"", name:"Chidi Okonkwo",  level:"PERMANENT STAFF", salary:18420, jobsDone:1241, accuracy:98.7, streak:42, tier:"Permanent", status:"Active",    joinedAt:"2025-11-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-a", permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:5000 },
  { id:"u2",  email:"aisha@deelai.uk",  phone:"", name:"Aisha Mensah",   level:"PERMANENT STAFF", salary:16800, jobsDone:1102, accuracy:98.2, streak:35, tier:"Permanent", status:"Active",    joinedAt:"2025-11-14", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-b", permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:3500 },
  { id:"u3",  email:"kwame@deelai.uk",  phone:"", name:"Kwame Asante",   level:"PERMANENT STAFF", salary:15990, jobsDone:1044, accuracy:97.9, streak:28, tier:"Permanent", status:"Active",    joinedAt:"2025-11-20", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-a", permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:5000 },
  { id:"u4",  email:"amara@deelai.uk",  phone:"", name:"Amara Osei",     level:"ASSOCIATE STAFF", salary:14750, jobsDone:984,  accuracy:97.4, streak:21, tier:"Associate", status:"Active",    joinedAt:"2025-12-01", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-b", permitType:"part-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:3500 },
  { id:"u5",  email:"fatima@deelai.uk", phone:"", name:"Fatima Bello",   level:"ASSOCIATE STAFF", salary:13200, jobsDone:901,  accuracy:96.8, streak:14, tier:"Associate", status:"Active",    joinedAt:"2025-12-05", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-a", permitType:"part-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0    },
  { id:"u6",  email:"emeka@deelai.uk",  phone:"", name:"Emeka Nwosu",    level:"ASSOCIATE STAFF", salary:12800, jobsDone:876,  accuracy:96.1, streak:10, tier:"Associate", status:"Active",    joinedAt:"2025-12-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-c", permitType:"full-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0    },
  { id:"u7",  email:"sade@deelai.uk",   phone:"", name:"Sade Williams",  level:"ASSOCIATE STAFF", salary:11500, jobsDone:820,  accuracy:95.5, streak:7,  tier:"Associate", status:"Active",    joinedAt:"2025-12-15", country:"GB", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-b", permitType:"part-time",  accountStatus:"rejected", jobPassPaid:false, jobPassAmount:0    },
  { id:"u8",  email:"tunde@deelai.uk",  phone:"", name:"Tunde Adeyemi",  level:"ASSOCIATE STAFF", salary:10900, jobsDone:794,  accuracy:94.9, streak:5,  tier:"Associate", status:"Active",    joinedAt:"2026-01-03", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-a", permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:5000 },
  { id:"u9",  email:"gideon@deelai.uk", phone:"", name:"Gideon NSE",     level:"ASSOCIATE STAFF", salary:9400,  jobsDone:620,  accuracy:93.2, streak:3,  tier:"Associate", status:"Suspended", joinedAt:"2026-01-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-c", permitType:"part-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:7500 },
  { id:"u10", email:"ravi@deelai.uk",   phone:"", name:"Ravi Sharma",    level:"ASSOCIATE STAFF", salary:8750,  jobsDone:540,  accuracy:92.8, streak:0,  tier:"Associate", status:"Active",    joinedAt:"2026-01-18", country:"IN", is_admin:false, is_super_admin:false, admin_permissions:[], admin_region:null, channelId:"ch-b", permitType:"part-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0    },
  { id:"u0",  email:SUPER_ADMIN_EMAIL,  phone:"", name:"Super Admin",    level:"SUPER ADMIN",     salary:0,     jobsDone:0,    accuracy:100,   streak:0,  tier:"Permanent", status:"Active",    joinedAt:"2025-10-01", country:"NG", is_admin:true,  is_super_admin:true,  admin_permissions:[], admin_region:"Global", accountStatus:"approved", jobPassPaid:false, jobPassAmount:0 },
];

// Super admin password hashed with bcrypt (password: #demUBCEO#)
const SUPER_ADMIN_PASSWORD_HASH = "$2b$10$d8zVAan.H5kJ3NlHzRr1RuaGDEbutlUf8Ts3sUplnlWNdZC9rCTOG";

// Demo seed passwords (plain text — bcrypt only for the super admin account)
const seedPasswords: Record<string, string> = {
  "chidi@deelai.uk":        "demo1234",
  "aisha@deelai.uk":        "demo1234",
  "kwame@deelai.uk":        "demo1234",
  "amara@deelai.uk":        "demo1234",
  "fatima@deelai.uk":       "demo1234",
  "emeka@deelai.uk":        "demo1234",
  "sade@deelai.uk":         "demo1234",
  "tunde@deelai.uk":        "demo1234",
  "gideon@deelai.uk":       "demo1234",
  "ravi@deelai.uk":         "demo1234",
  "channel.a@deelai.uk":    "admin1234",
  "channel.b@deelai.uk":    "admin1234",
  "channel.c@deelai.uk":    "admin1234",
  [SUPER_ADMIN_EMAIL]:      SUPER_ADMIN_PASSWORD_HASH,
};

const seedJobs: Job[] = [
  { id:"j1",  userId:"u1", userName:"Chidi Okonkwo", type:"Image Annotation",     batchId:"A-2291", status:"Approved", earnings:12.50, submittedAt:"2026-07-01T10:02:00Z", accuracy:99.1 },
  { id:"j2",  userId:"u2", userName:"Aisha Mensah",  type:"Image Annotation",     batchId:"A-2290", status:"Approved", earnings:12.50, submittedAt:"2026-07-01T09:44:00Z", accuracy:98.7 },
  { id:"j3",  userId:"u3", userName:"Kwame Asante",  type:"Voice Transcription",  batchId:"T-0821", status:"Pending",  earnings:18.00, submittedAt:"2026-07-01T09:10:00Z", accuracy:0    },
  { id:"j4",  userId:"u4", userName:"Amara Osei",    type:"Image Annotation",     batchId:"A-2289", status:"Approved", earnings:12.50, submittedAt:"2026-06-30T14:22:00Z", accuracy:97.4 },
  { id:"j5",  userId:"u5", userName:"Fatima Bello",  type:"Content Intelligence", batchId:"C-0442", status:"Rejected", earnings:0,     submittedAt:"2026-06-30T11:55:00Z", accuracy:62.0 },
  { id:"j6",  userId:"u6", userName:"Emeka Nwosu",   type:"Image Annotation",     batchId:"A-2288", status:"Approved", earnings:12.50, submittedAt:"2026-06-30T08:30:00Z", accuracy:96.2 },
  { id:"j7",  userId:"u7", userName:"Sade Williams", type:"Image Annotation",     batchId:"A-2287", status:"Approved", earnings:12.50, submittedAt:"2026-06-29T16:45:00Z", accuracy:95.8 },
  { id:"j8",  userId:"u8", userName:"Tunde Adeyemi", type:"Voice Transcription",  batchId:"T-0820", status:"Pending",  earnings:18.00, submittedAt:"2026-06-29T13:20:00Z", accuracy:0    },
  { id:"j9",  userId:"u1", userName:"Chidi Okonkwo", type:"Image Annotation",     batchId:"A-2286", status:"Approved", earnings:12.50, submittedAt:"2026-06-29T10:05:00Z", accuracy:99.3 },
  { id:"j10", userId:"u2", userName:"Aisha Mensah",  type:"Content Intelligence", batchId:"C-0441", status:"Approved", earnings:9.50,  submittedAt:"2026-06-28T15:30:00Z", accuracy:98.1 },
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
  { id:"r5", referrerId:"u4", referrerName:"Amara Osei",    recruitName:"Gideon NSE",    recruitEmail:"gideon@deelai.uk", status:"Inactive", bonusEarned:40,  joinedAt:"2026-01-10" },
  { id:"r6", referrerId:"u2", referrerName:"Aisha Mensah",  recruitName:"Ravi Sharma",   recruitEmail:"ravi@deelai.uk",   status:"Active",   bonusEarned:80,  joinedAt:"2026-01-18" },
];

/* ── Singleton store ────────────────────────────────────────────────── */
class AdminStore {
  users:              AdminUser[]          = [...seedUsers];
  jobs:               Job[]               = [...seedJobs];
  payments:           Payment[]           = [...seedPayments];
  referrals:          Referral[]          = [...seedReferrals];
  subAdmins:          SubAdmin[]          = [...seedSubAdmins];
  channels:           Channel[]           = [...seedChannels];
  channelCommissions: ChannelCommission[] = [];
  passwords:          Map<string, string> = new Map(Object.entries(seedPasswords));
  settings:           PlatformSettings   = {
    registrationOpen: true, maintenanceMode: false,
    payoutsEnabled: true, newJobsEnabled: true, announcement: "",
  };

  /* ── Auth: admin ──────────────────────────────────────────────────── */
  isAdmin(email: string): boolean {
    if (email === SUPER_ADMIN_EMAIL) return true;
    return this.subAdmins.some((s) => s.email === email);
  }
  isSuperAdmin(email: string): boolean { return email === SUPER_ADMIN_EMAIL; }

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

  /* ── Auth: user (workers) ─────────────────────────────────────────── */
  verifyPassword(email: string, password: string): boolean {
    const stored = this.passwords.get(email);
    if (!stored) return false;
    // Bcrypt hashes start with $2b$ or $2a$
    if (stored.startsWith("$2")) return bcrypt.compareSync(password, stored);
    return stored === password;
  }

  setPassword(email: string, password: string) {
    // Never overwrite a bcrypt hash with a plain-text value
    const existing = this.passwords.get(email);
    if (existing?.startsWith("$2")) return;
    this.passwords.set(email, password);
  }

  getUserByEmail(email: string): AdminUser | null {
    return this.users.find((u) => u.email === email) ?? null;
  }

  getUserById(id: string): AdminUser | null {
    return this.users.find((u) => u.id === id) ?? null;
  }

  /* ── Sub-admin CRUD ───────────────────────────────────────────────── */
  createSubAdmin(data: Omit<SubAdmin, "id" | "createdAt">): SubAdmin {
    const sa: SubAdmin = { ...data, id: `sa-${Date.now()}`, createdAt: new Date().toISOString() };
    this.subAdmins.push(sa);
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

  /* ── Channel CRUD ─────────────────────────────────────────────────── */
  getChannelByOwner(email: string): Channel | null {
    return this.channels.find((c) => c.ownerEmail === email) ?? null;
  }
  getChannelById(id: string): Channel | null {
    return this.channels.find((c) => c.id === id) ?? null;
  }
  getActiveChannels(): Channel[] {
    return this.channels.filter((c) => c.isActive);
  }

  createChannel(data: Omit<Channel, "id" | "balance" | "createdAt">): Channel {
    if (this.channels.some((c) => c.ownerEmail === data.ownerEmail)) {
      throw new Error("Channel already exists for this admin");
    }
    const ch: Channel = { ...data, id: `ch-${Date.now()}`, balance: 0, createdAt: new Date().toISOString() };
    this.channels.push(ch);
    return ch;
  }

  updateChannel(id: string, data: Partial<Omit<Channel, "id" | "ownerEmail" | "createdAt">>) {
    const ch = this.channels.find((c) => c.id === id);
    if (!ch) return null;
    Object.assign(ch, data);
    return ch;
  }

  /* ── Channel registrations ────────────────────────────────────────── */
  getChannelRegistrations(channelId: string): AdminUser[] {
    return this.users.filter((u) => u.channelId === channelId);
  }
  getAllRegistrations(): AdminUser[] {
    return this.users.filter((u) => !!u.channelId);
  }

  /** Create or update a user record during the registration flow. */
  registerUser(data: {
    name: string; email: string; phone: string; password: string;
    channelId: string; permitType?: PermitType;
    cvUrl?: string; jobPassPaid?: boolean; jobPassAmount?: number;
    paystackRef?: string;
  }): AdminUser {
    const existing = this.users.find((u) => u.email === data.email);
    if (existing) {
      if (data.channelId)   existing.channelId    = data.channelId;
      if (data.permitType)  existing.permitType   = data.permitType;
      if (data.cvUrl)       existing.cvUrl        = data.cvUrl;
      if (data.phone)       existing.phone        = data.phone;
      if (data.jobPassPaid !== undefined) existing.jobPassPaid  = data.jobPassPaid;
      if (data.jobPassAmount !== undefined) existing.jobPassAmount = data.jobPassAmount;
      if (!existing.registeredAt) existing.registeredAt = new Date().toISOString();
      this.setPassword(data.email, data.password || this.passwords.get(data.email) || "");
      if (data.jobPassPaid) this._creditCommission(data.channelId, existing.id, existing.name, data.jobPassAmount ?? 0);
      return existing;
    }
    const newUser: AdminUser = {
      id:              `u-${Date.now()}`,
      email:           data.email,
      name:            data.name,
      phone:           data.phone,
      level:           "ASSOCIATE STAFF",
      salary:          0, jobsDone: 0, accuracy: 0, streak: 0,
      tier:            "Associate",
      status:          "Active",
      joinedAt:        new Date().toISOString().split("T")[0],
      country:         "",
      is_admin:        false, is_super_admin: false,
      admin_permissions: [], admin_region: null,
      channelId:       data.channelId,
      permitType:      data.permitType,
      accountStatus:   "pending",
      cvUrl:           data.cvUrl,
      jobPassPaid:     data.jobPassPaid   ?? false,
      jobPassAmount:   data.jobPassAmount ?? 0,
      registeredAt:    new Date().toISOString(),
    };
    this.users.push(newUser);
    this.setPassword(data.email, data.password);
    if (data.jobPassPaid) this._creditCommission(data.channelId, newUser.id, newUser.name, data.jobPassAmount ?? 0);
    return newUser;
  }

  /** Update job-pass payment info after Paystack callback. */
  updateJobPass(userId: string, permitType: PermitType, jobPassAmount: number, channelId: string, paystackRef: string) {
    const u = this.users.find((u) => u.id === userId);
    if (!u) return null;
    u.permitType    = permitType;
    u.jobPassPaid   = true;
    u.jobPassAmount = jobPassAmount;
    this._creditCommission(channelId, userId, u.name, jobPassAmount);
    void paystackRef; // stored for audit in production
    return u;
  }

  approveRegistration(userId: string): AdminUser | null {
    const u = this.users.find((u) => u.id === userId);
    if (!u) return null;
    u.accountStatus = "approved";
    return u;
  }

  rejectRegistration(userId: string): AdminUser | null {
    const u = this.users.find((u) => u.id === userId);
    if (!u) return null;
    u.accountStatus = "rejected";
    return u;
  }

  private _creditCommission(channelId: string, userId: string, userName: string, paidAmount: number) {
    const ch = this.channels.find((c) => c.id === channelId);
    if (!ch || paidAmount <= 0) return;
    const commission = (paidAmount * ch.referralCommissionRate) / 100;
    ch.balance += commission;
    this.channelCommissions.push({
      id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channelId, userId, userName, amount: commission,
      createdAt: new Date().toISOString(),
    });
  }

  /* ── User management ──────────────────────────────────────────────── */
  suspendUser(id: string)  { const u = this.users.find((u) => u.id === id); if (u) u.status = "Suspended"; return u ?? null; }
  activateUser(id: string) { const u = this.users.find((u) => u.id === id); if (u) u.status = "Active";    return u ?? null; }

  /* ── Stats ────────────────────────────────────────────────────────── */
  getStats() {
    const totalSalaryPaid = this.payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const pendingPayouts  = this.payments.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);
    return {
      totalUsers:           this.users.filter((u) => !u.is_super_admin).length,
      activeUsers:          this.users.filter((u) => u.status === "Active" && !u.is_super_admin).length,
      suspendedUsers:       this.users.filter((u) => u.status === "Suspended").length,
      permanentStaff:       this.users.filter((u) => u.tier === "Permanent" && !u.is_super_admin).length,
      totalJobs:            this.jobs.length,
      approvedJobs:         this.jobs.filter((j) => j.status === "Approved").length,
      pendingJobs:          this.jobs.filter((j) => j.status === "Pending").length,
      rejectedJobs:         this.jobs.filter((j) => j.status === "Rejected").length,
      totalSalaryPaid, pendingPayouts,
      totalReferrals:       this.referrals.length,
      activeReferrals:      this.referrals.filter((r) => r.status === "Active").length,
      totalSubAdmins:       this.subAdmins.length,
      totalChannels:        this.channels.length,
      pendingRegistrations: this.users.filter((u) => u.accountStatus === "pending").length,
    };
  }
}

const g = global as typeof global & { adminStore?: AdminStore };
if (!g.adminStore) g.adminStore = new AdminStore();
export const adminStore = g.adminStore;
