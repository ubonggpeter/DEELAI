/**
 * Async data layer backed by Supabase / Prisma.
 * All mutating operations hit the database directly — no in-memory state.
 */
import bcrypt from "bcryptjs";
import { SUPER_ADMIN_EMAIL, type Permission } from "./adminConfig";
import { prisma } from "./prisma";

/* ── Re-export types ─────────────────────────────────────────────────── */
export type { Permission };

export type PermitType    = "full-time" | "part-time";
export type AccountStatus = "pending"   | "approved"  | "rejected";

export interface SubAdmin {
  id: string; email: string; name: string; region: string;
  permissions: Permission[]; createdAt: string; createdBy: string;
}
export interface Channel {
  id: string; ownerEmail: string; channelName: string; description: string;
  estTime: string; paystackPublicKey: string; paystackSecretKey: string;
  lensPaystackLink: string; referralCommissionRate: number; jobPassFee: number;
  isActive: boolean; balance: number; region: string; createdAt: string;
  workWalletEnabled: boolean; recruitWalletEnabled: boolean;
}
export interface QuizQuestion { id: string; q: string; opts: string[]; ans: number; }
export interface TrainingDoc { id: string; title: string; url: string; type: "pdf" | "doc" | "link"; ownerEmail?: string | null; addedAt: string; }
export interface AnnotationJob {
  id: string; channelId: string | null; title: string; description: string;
  imageUrls: string[]; labels: string[]; difficulty: string; createdBy: string; createdAt: string;
}
export interface ReferralBonus {
  id: string; channelId: string; referrerId: string; referrerName: string;
  referrerEmail: string; recruitEmail: string; recruitName: string; amount: number;
  status: "pending" | "claimed" | "auto-credited"; createdAt: string;
  claimedAt?: string; autoCreditsAt: string;
}
export interface ChannelCommission {
  id: string; channelId: string; userId: string; userName: string;
  amount: number; createdAt: string;
}
export interface AdminUser {
  id: string; email: string; name: string; displayName?: string; phone: string;
  level: string; salary: number; recruitWallet: number; jobsDone: number; accuracy: number; streak: number;
  tier: "Permanent" | "Associate"; status: "Active" | "Suspended";
  joinedAt: string; country: string; is_admin: boolean; is_super_admin: boolean;
  admin_permissions: Permission[]; admin_region: string | null; channelId?: string;
  permitType?: PermitType; accountStatus: AccountStatus; cvUrl?: string;
  jobPassPaid: boolean; jobPassAmount: number; registeredAt?: string;
  refCode: string; referredByUserId?: string;
  quizPassed: boolean; lensActivated: boolean; trainingDone: boolean; completedModules: number[];
  avatarUrl?: string;
  adminAvatarUrl?: string;
  bankCode?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string;
  jobsToday: number; lastJobDate: string;
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
  commissionEnabled: boolean; commissionWallet: number;
  leaderboardThreshold: number;
}

/* ── Mappers (Prisma → our types) ────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(u: any): AdminUser {
  return {
    id: u.id, email: u.email, name: u.name, displayName: u.displayName ?? undefined,
    phone: u.phone, level: u.level, salary: u.salary, recruitWallet: u.recruitWallet ?? 0, jobsDone: u.jobsDone,
    accuracy: u.accuracy, streak: u.streak, tier: u.tier as "Permanent" | "Associate",
    status: u.status as "Active" | "Suspended", joinedAt: u.joinedAt, country: u.country,
    is_admin: u.is_admin, is_super_admin: u.is_super_admin,
    admin_permissions: (u.admin_permissions ?? []) as Permission[],
    admin_region: u.admin_region ?? null,
    channelId: u.channelId ?? undefined,
    permitType: u.permitType as PermitType | undefined,
    accountStatus: u.accountStatus as AccountStatus,
    cvUrl: u.cvUrl ?? undefined, jobPassPaid: u.jobPassPaid, jobPassAmount: u.jobPassAmount,
    registeredAt: u.registeredAt?.toISOString() ?? undefined,
    refCode: u.refCode, referredByUserId: u.referredByUserId ?? undefined,
    quizPassed: u.quizPassed, lensActivated: u.lensActivated,
    trainingDone: u.trainingDone, completedModules: u.completedModules ?? [],
    avatarUrl: u.avatarUrl ?? undefined,
    adminAvatarUrl: u.adminAvatarUrl ?? undefined,
    bankCode: u.bankCode ?? undefined, bankName: u.bankName ?? undefined,
    bankAccountNumber: u.bankAccountNumber ?? undefined, bankAccountName: u.bankAccountName ?? undefined,
    jobsToday: u.jobsToday ?? 0, lastJobDate: u.lastJobDate ?? "",
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannel(c: any): Channel {
  return {
    id: c.id, ownerEmail: c.ownerEmail, channelName: c.channelName,
    description: c.description, estTime: c.estTime,
    paystackPublicKey: c.paystackPublicKey, paystackSecretKey: c.paystackSecretKey,
    lensPaystackLink: c.lensPaystackLink, referralCommissionRate: c.referralCommissionRate,
    jobPassFee: c.jobPassFee, isActive: c.isActive, balance: c.balance, region: c.region,
    workWalletEnabled: c.workWalletEnabled ?? true,
    recruitWalletEnabled: c.recruitWalletEnabled ?? true,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubAdmin(s: any): SubAdmin {
  return {
    id: s.id, email: s.email, name: s.name, region: s.region,
    permissions: (s.permissions ?? []) as Permission[],
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    createdBy: s.createdBy,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReferralBonus(b: any): ReferralBonus {
  return {
    id: b.id, channelId: b.channelId, referrerId: b.referrerId,
    referrerName: b.referrerName, referrerEmail: b.referrerEmail,
    recruitEmail: b.recruitEmail, recruitName: b.recruitName, amount: b.amount,
    status: b.status as "pending" | "claimed" | "auto-credited",
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    claimedAt: b.claimedAt instanceof Date ? b.claimedAt.toISOString() : b.claimedAt ?? undefined,
    autoCreditsAt: b.autoCreditsAt instanceof Date ? b.autoCreditsAt.toISOString() : b.autoCreditsAt,
  };
}

/* ── adminStore object ───────────────────────────────────────────────── */
export const adminStore = {

  /* ── Auth: admin (sync where possible) ─────────────────────────────── */
  isSuperAdmin(email: string): boolean { return email === SUPER_ADMIN_EMAIL; },

  async isAdmin(email: string): Promise<boolean> {
    if (email === SUPER_ADMIN_EMAIL) return true;
    const sa = await prisma.subAdmin.findUnique({ where: { email } });
    return sa !== null;
  },

  async getAdminInfo(email: string) {
    if (email === SUPER_ADMIN_EMAIL) {
      return { email, isSuperAdmin: true, permissions: [] as Permission[], region: "Global" };
    }
    const sa = await prisma.subAdmin.findUnique({ where: { email } });
    if (!sa) return null;
    return { email, isSuperAdmin: false, permissions: sa.permissions as Permission[], region: sa.region };
  },

  async hasPermission(email: string, perm: Permission): Promise<boolean> {
    if (email === SUPER_ADMIN_EMAIL) return true;
    const sa = await prisma.subAdmin.findUnique({ where: { email } });
    return sa ? (sa.permissions as Permission[]).includes(perm) : false;
  },

  /* ── Auth: user ─────────────────────────────────────────────────────── */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return false;
    if (user.passwordHash.startsWith("$2")) return bcrypt.compare(password, user.passwordHash);
    return user.passwordHash === password;
  },

  async getUserByEmail(email: string): Promise<AdminUser | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    return u ? mapUser(u) : null;
  },

  async getUserById(id: string): Promise<AdminUser | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? mapUser(u) : null;
  },

  async getUserByRefCode(refCode: string): Promise<AdminUser | null> {
    const u = await prisma.user.findUnique({ where: { refCode } });
    return u ? mapUser(u) : null;
  },

  async getAllUsers(): Promise<AdminUser[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map(mapUser);
  },

  /* ── Sub-admin CRUD ─────────────────────────────────────────────────── */
  async getAllSubAdmins(): Promise<SubAdmin[]> {
    const sas = await prisma.subAdmin.findMany({ orderBy: { createdAt: "asc" } });
    return sas.map(mapSubAdmin);
  },

  async createSubAdmin(data: Omit<SubAdmin, "id" | "createdAt">): Promise<SubAdmin> {
    const id = `sa-${Date.now()}`;
    const sa = await prisma.subAdmin.create({
      data: { id, email: data.email, name: data.name, region: data.region,
              permissions: data.permissions as string[], createdBy: data.createdBy },
    });
    // Promote user record if exists
    await prisma.user.updateMany({
      where: { email: data.email },
      data: { is_admin: true, admin_permissions: data.permissions as string[], admin_region: data.region },
    });
    // Auto-create and activate channel — must be immediately visible on the landing page
    const existing = await prisma.channel.findUnique({ where: { ownerEmail: data.email } });
    if (!existing) {
      await prisma.channel.create({
        data: {
          id: `ch-${Date.now()}`, ownerEmail: data.email,
          channelName: `${data.name.split(" ")[0]} Channel`,
          description: `Channel managed by ${data.name} (${data.region})`,
          estTime: "5 min", referralCommissionRate: 10, jobPassFee: 25,
          isActive: true, balance: 0, region: data.region,
        },
      });
    } else if (!existing.isActive) {
      // Reactivate if previously deactivated (e.g. sub-admin was removed then re-promoted)
      await prisma.channel.update({ where: { ownerEmail: data.email }, data: { isActive: true } });
    }
    return mapSubAdmin(sa);
  },

  async updateSubAdmin(id: string, data: Partial<Pick<SubAdmin, "region" | "permissions">>): Promise<SubAdmin | null> {
    try {
      const sa = await prisma.subAdmin.update({
        where: { id },
        data: {
          ...(data.region      ? { region: data.region } : {}),
          ...(data.permissions ? { permissions: data.permissions as string[] } : {}),
        },
      });
      await prisma.user.updateMany({
        where: { email: sa.email },
        data: { admin_permissions: sa.permissions, admin_region: sa.region },
      });
      return mapSubAdmin(sa);
    } catch { return null; }
  },

  async deleteSubAdmin(id: string): Promise<boolean> {
    const sa = await prisma.subAdmin.findUnique({ where: { id } });
    if (!sa) return false;
    await prisma.subAdmin.delete({ where: { id } });
    // Revoke admin flag on the user record
    await prisma.user.updateMany({
      where: { email: sa.email },
      data: { is_admin: false, admin_permissions: [], admin_region: null },
    });
    // Deactivate their channel so it disappears from the landing page immediately.
    // We deactivate (not delete) to preserve registrations already under this channel.
    await prisma.channel.updateMany({
      where: { ownerEmail: sa.email },
      data: { isActive: false },
    });
    return true;
  },

  /* ── Channel CRUD ───────────────────────────────────────────────────── */
  async getAllChannels(): Promise<Channel[]> {
    const channels = await prisma.channel.findMany({ orderBy: { createdAt: "asc" } });
    return channels.map(mapChannel);
  },

  async getChannelByOwner(email: string): Promise<Channel | null> {
    const ch = await prisma.channel.findUnique({ where: { ownerEmail: email } });
    return ch ? mapChannel(ch) : null;
  },

  async getChannelById(id: string): Promise<Channel | null> {
    const ch = await prisma.channel.findUnique({ where: { id } });
    return ch ? mapChannel(ch) : null;
  },

  async getActiveChannels(): Promise<Channel[]> {
    const channels = await prisma.channel.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
    return channels.map(mapChannel);
  },

  async createChannel(data: Omit<Channel, "id" | "balance" | "createdAt">): Promise<Channel> {
    const existing = await prisma.channel.findUnique({ where: { ownerEmail: data.ownerEmail } });
    if (existing) throw new Error("Channel already exists for this admin");
    const ch = await prisma.channel.create({
      data: { id: `ch-${Date.now()}`, ...data, balance: 0 },
    });
    return mapChannel(ch);
  },

  async updateChannel(id: string, data: Partial<Omit<Channel, "id" | "ownerEmail" | "createdAt">>): Promise<Channel> {
    // Strip read-only / non-updatable fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { id: _id, ownerEmail: _oe, createdAt: _ca, balance: _bal, ...safe } = data as any;
    void _id; void _oe; void _ca; void _bal;

    // Sanitize string fields — null/undefined values from old DB rows would fail Prisma's
    // non-nullable String validation; replace with empty string to be safe
    const STRING_FIELDS = ["channelName", "description", "estTime", "paystackPublicKey",
                           "paystackSecretKey", "lensPaystackLink", "region"];
    for (const f of STRING_FIELDS) {
      if (f in safe && (safe[f] === null || safe[f] === undefined)) safe[f] = "";
    }

    // Coerce numeric fields — form inputs always send strings via e.target.value
    if (safe.referralCommissionRate !== undefined) {
      const n = Number(safe.referralCommissionRate);
      safe.referralCommissionRate = isNaN(n) ? 0 : n;
    }
    if (safe.jobPassFee !== undefined) {
      const n = Number(safe.jobPassFee);
      safe.jobPassFee = isNaN(n) ? 0 : n;
    }

    // Coerce boolean fields — guard for stale string "true"/"false"
    if (safe.isActive             !== undefined) safe.isActive             = safe.isActive             === true || safe.isActive             === "true";
    if (safe.workWalletEnabled    !== undefined) safe.workWalletEnabled    = safe.workWalletEnabled    === true || safe.workWalletEnabled    === "true";
    if (safe.recruitWalletEnabled !== undefined) safe.recruitWalletEnabled = safe.recruitWalletEnabled === true || safe.recruitWalletEnabled === "true";

    const ch = await prisma.channel.update({ where: { id }, data: safe });
    return mapChannel(ch);
  },

  /* ── Channel registrations ──────────────────────────────────────────── */
  async getChannelRegistrations(channelId: string): Promise<AdminUser[]> {
    const users = await prisma.user.findMany({ where: { channelId } });
    return users.map(mapUser);
  },

  async getAllRegistrations(): Promise<AdminUser[]> {
    const users = await prisma.user.findMany({ where: { channelId: { not: null } } });
    return users.map(mapUser);
  },

  async registerUser(data: {
    name: string; email: string; phone: string; password: string;
    channelId: string; permitType?: PermitType;
    cvUrl?: string; jobPassPaid?: boolean; jobPassAmount?: number;
    paystackRef?: string; refCode?: string;
  }): Promise<AdminUser> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email: data.email },
        data: {
          ...(data.channelId    ? { channelId: data.channelId }       : {}),
          ...(data.permitType   ? { permitType: data.permitType }      : {}),
          ...(data.cvUrl        ? { cvUrl: data.cvUrl }               : {}),
          ...(data.phone        ? { phone: data.phone }               : {}),
          ...(data.jobPassPaid  !== undefined ? { jobPassPaid: data.jobPassPaid }     : {}),
          ...(data.jobPassAmount !== undefined ? { jobPassAmount: data.jobPassAmount } : {}),
          ...(!existing.registeredAt ? { registeredAt: new Date() } : {}),
        },
      });
      if (data.jobPassPaid) await this._creditCommission(data.channelId, existing.id, existing.name, data.jobPassAmount ?? 0);
      return mapUser(updated);
    }
    // Resolve referrer
    let referredByUserId: string | undefined;
    if (data.refCode) {
      const referrer = await prisma.user.findUnique({ where: { refCode: data.refCode } });
      if (referrer) referredByUserId = referrer.id;
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const refCode = await this.generateRefCode();
    const newUser = await prisma.user.create({
      data: {
        id: `u-${Date.now()}`, email: data.email, name: data.name, phone: data.phone,
        level: "ASSOCIATE STAFF", salary: 0, jobsDone: 0, accuracy: 0, streak: 0,
        tier: "Associate", status: "Active",
        joinedAt: new Date().toISOString().split("T")[0], country: "",
        is_admin: false, is_super_admin: false, admin_permissions: [], admin_region: null,
        channelId: data.channelId, permitType: data.permitType,
        accountStatus: "pending", cvUrl: data.cvUrl,
        jobPassPaid: data.jobPassPaid ?? false, jobPassAmount: data.jobPassAmount ?? 0,
        registeredAt: new Date(), refCode, referredByUserId,
        quizPassed: false, lensActivated: false, trainingDone: false, completedModules: [],
        passwordHash,
      },
    });
    if (data.jobPassPaid) await this._creditCommission(data.channelId, newUser.id, newUser.name, data.jobPassAmount ?? 0);
    return mapUser(newUser);
  },

  async updateJobPass(userId: string, permitType: PermitType, jobPassAmount: number, channelId: string, _paystackRef: string): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({
        where: { id: userId },
        data: { permitType, jobPassPaid: true, jobPassAmount },
      });
      await this._creditCommission(channelId, userId, u.name, jobPassAmount);
      await this.createReferralBonusForRegistration(userId, channelId);
      return mapUser(u);
    } catch { return null; }
  },

  async approveRegistration(userId: string, approvedByEmail?: string): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: "approved", approvedBy: approvedByEmail ?? null },
      });
      return mapUser(u);
    } catch { return null; }
  },

  async rejectRegistration(userId: string): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id: userId }, data: { accountStatus: "rejected" } });
      return mapUser(u);
    } catch { return null; }
  },

  async suspendUser(id: string): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id }, data: { status: "Suspended" } });
      return mapUser(u);
    } catch { return null; }
  },

  async activateUser(id: string): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id }, data: { status: "Active" } });
      return mapUser(u);
    } catch { return null; }
  },

  async _deductSuperAdminCommission(grossAmount: number): Promise<number> {
    const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
    if (!(settings as { commissionEnabled?: boolean } | null)?.commissionEnabled) return grossAmount;
    const cut = Math.round(grossAmount * 0.10 * 100) / 100;
    if (cut <= 0) return grossAmount;
    await prisma.platformSettings.update({
      where: { id: "singleton" },
      data: { commissionWallet: { increment: cut } },
    });
    return Math.round((grossAmount - cut) * 100) / 100;
  },

  async _creditCommission(channelId: string, userId: string, userName: string, paidAmount: number) {
    const ch = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!ch || paidAmount <= 0) return;
    const gross = (paidAmount * ch.referralCommissionRate) / 100;
    const commission = await this._deductSuperAdminCommission(gross);
    await prisma.channel.update({ where: { id: channelId }, data: { balance: { increment: commission } } });
    await prisma.channelCommission.create({
      data: {
        id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        channelId, userId, userName, amount: commission,
      },
    });
  },

  /* ── Ref code ───────────────────────────────────────────────────────── */
  async generateRefCode(): Promise<string> {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) code += alpha[Math.floor(Math.random() * 26)];
    for (let i = 0; i < 2; i++) code += digits[Math.floor(Math.random() * 10)];
    const existing = await prisma.user.findUnique({ where: { refCode: code } });
    if (existing) return this.generateRefCode();
    return code;
  },

  /* ── Training / Quiz ────────────────────────────────────────────────── */

  // Global super-admin questions (ownerEmail IS NULL)
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    const qs = await prisma.quizQuestion.findMany({ where: { ownerEmail: null }, orderBy: { sortOrder: "asc" } });
    return qs.map((q) => ({ id: q.id, q: q.q, opts: q.opts, ans: q.ans }));
  },
  async setQuizQuestions(questions: QuizQuestion[]): Promise<void> {
    await prisma.quizQuestion.deleteMany({ where: { ownerEmail: null } });
    if (questions.length === 0) return;
    await prisma.quizQuestion.createMany({
      data: questions.map((q, i) => ({ id: q.id || `q-${Date.now()}-${i}`, ownerEmail: null, q: q.q, opts: q.opts, ans: q.ans, sortOrder: i })),
    });
  },

  // Per-owner quiz (ownerEmail = sub-admin email, or null = super admin)
  async getQuizQuestionsForOwner(ownerEmail: string | null): Promise<QuizQuestion[]> {
    const qs = await prisma.quizQuestion.findMany({ where: { ownerEmail }, orderBy: { sortOrder: "asc" } });
    return qs.map((q) => ({ id: q.id, q: q.q, opts: q.opts, ans: q.ans }));
  },
  async setQuizQuestionsForOwner(ownerEmail: string | null, questions: QuizQuestion[]): Promise<void> {
    await prisma.quizQuestion.deleteMany({ where: { ownerEmail } });
    if (questions.length === 0) return;
    await prisma.quizQuestion.createMany({
      data: questions.map((q, i) => ({
        id: q.id || `q-${Date.now()}-${i}`,
        ownerEmail, q: q.q, opts: q.opts, ans: q.ans, sortOrder: i,
      })),
    });
  },

  // Used by training-content endpoint: returns approver's questions, falls back to global
  async getQuizQuestionsForApprover(approvedBy: string | null): Promise<QuizQuestion[]> {
    if (!approvedBy || approvedBy === SUPER_ADMIN_EMAIL) return this.getQuizQuestions();
    const qs = await this.getQuizQuestionsForOwner(approvedBy);
    return qs.length > 0 ? qs : this.getQuizQuestions(); // fall back to global if sub-admin hasn't set any
  },

  async getTrainingDocs(): Promise<TrainingDoc[]> {
    const docs = await prisma.trainingDoc.findMany({ where: { ownerEmail: null }, orderBy: { addedAt: "asc" } });
    return docs.map((d) => ({
      id: d.id, title: d.title, url: d.url, type: d.type as "pdf" | "doc" | "link",
      ownerEmail: d.ownerEmail ?? null,
      addedAt: d.addedAt instanceof Date ? d.addedAt.toISOString() : d.addedAt,
    }));
  },

  async getTrainingDocsForChannel(channelOwnerEmail: string | null): Promise<TrainingDoc[]> {
    // Returns global docs + channel-specific docs merged
    const where = channelOwnerEmail
      ? { OR: [{ ownerEmail: null }, { ownerEmail: channelOwnerEmail }] }
      : { ownerEmail: null };
    const docs = await prisma.trainingDoc.findMany({ where, orderBy: { addedAt: "asc" } });
    return docs.map((d) => ({
      id: d.id, title: d.title, url: d.url, type: d.type as "pdf" | "doc" | "link",
      ownerEmail: d.ownerEmail ?? null,
      addedAt: d.addedAt instanceof Date ? d.addedAt.toISOString() : d.addedAt,
    }));
  },

  async getTrainingDocsForOwner(ownerEmail: string | null): Promise<TrainingDoc[]> {
    const docs = await prisma.trainingDoc.findMany({ where: { ownerEmail }, orderBy: { addedAt: "asc" } });
    return docs.map((d) => ({
      id: d.id, title: d.title, url: d.url, type: d.type as "pdf" | "doc" | "link",
      ownerEmail: d.ownerEmail ?? null,
      addedAt: d.addedAt instanceof Date ? d.addedAt.toISOString() : d.addedAt,
    }));
  },

  async addTrainingDoc(data: Omit<TrainingDoc, "id" | "addedAt">): Promise<TrainingDoc> {
    const doc = await prisma.trainingDoc.create({
      data: { id: `doc-${Date.now()}`, title: data.title, url: data.url, type: data.type, ownerEmail: data.ownerEmail ?? null },
    });
    return { id: doc.id, title: doc.title, url: doc.url, type: doc.type as "pdf" | "doc" | "link",
             ownerEmail: doc.ownerEmail ?? null, addedAt: doc.addedAt.toISOString() };
  },

  async removeTrainingDoc(id: string): Promise<boolean> {
    try {
      await prisma.trainingDoc.delete({ where: { id } });
      return true;
    } catch { return false; }
  },

  /* ── Annotation Jobs ────────────────────────────────────────────── */
  async getAnnotationJobs(channelId: string | null): Promise<AnnotationJob[]> {
    // Returns channel-specific jobs; if none, falls back to global (channelId = null)
    if (channelId) {
      const channelJobs = await prisma.annotationJob.findMany({ where: { channelId }, orderBy: { createdAt: "asc" } });
      if (channelJobs.length > 0) {
        return channelJobs.map(j => ({
          id: j.id, channelId: j.channelId, title: j.title, description: j.description,
          imageUrls: j.imageUrls, labels: j.labels, difficulty: j.difficulty,
          createdBy: j.createdBy, createdAt: j.createdAt instanceof Date ? j.createdAt.toISOString() : j.createdAt,
        }));
      }
    }
    // Fall back to global
    const globalJobs = await prisma.annotationJob.findMany({ where: { channelId: null }, orderBy: { createdAt: "asc" } });
    return globalJobs.map(j => ({
      id: j.id, channelId: j.channelId, title: j.title, description: j.description,
      imageUrls: j.imageUrls, labels: j.labels, difficulty: j.difficulty,
      createdBy: j.createdBy, createdAt: j.createdAt instanceof Date ? j.createdAt.toISOString() : j.createdAt,
    }));
  },

  async addAnnotationJob(data: Omit<AnnotationJob, "id" | "createdAt">): Promise<AnnotationJob> {
    const j = await prisma.annotationJob.create({
      data: {
        id: `aj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        channelId: data.channelId, title: data.title, description: data.description,
        imageUrls: data.imageUrls, labels: data.labels, difficulty: data.difficulty, createdBy: data.createdBy,
      },
    });
    return {
      id: j.id, channelId: j.channelId, title: j.title, description: j.description,
      imageUrls: j.imageUrls, labels: j.labels, difficulty: j.difficulty,
      createdBy: j.createdBy, createdAt: j.createdAt.toISOString(),
    };
  },

  async deleteAnnotationJob(id: string): Promise<boolean> {
    try { await prisma.annotationJob.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  /* ── Wallet / Withdrawal ─────────────────────────────────────────── */
  async withdrawFromWallet(userId: string, walletType: "work" | "recruit", amount: number, method: string): Promise<{ ok: boolean; error?: string; ref?: string; newWorkWallet?: number; newRecruitWallet?: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { salary: true, recruitWallet: true, name: true } });
    if (!user) return { ok: false, error: "User not found" };
    const balance = walletType === "work" ? user.salary : user.recruitWallet;
    if (amount > balance) return { ok: false, error: "Insufficient balance" };
    if (amount < 10) return { ok: false, error: "Minimum withdrawal is $10" };
    const ref = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const field = walletType === "work" ? { salary: { decrement: amount } } : { recruitWallet: { decrement: amount } };
    const updated = await prisma.user.update({ where: { id: userId }, data: field });
    await prisma.payment.create({
      data: {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        userId, userName: user.name, amount,
        method: method as "Bank Transfer" | "USDT / Crypto" | "PayPal",
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
        ref,
      },
    });
    return { ok: true, ref, newWorkWallet: updated.salary, newRecruitWallet: updated.recruitWallet };
  },

  /* ── Password Reset Requests ─────────────────────────────────────────── */
  async createPasswordResetRequest(userId: string, channelId: string): Promise<{ id: string }> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const req = await prisma.passwordResetRequest.create({
      data: { id: `pr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, userId, channelId, expiresAt },
    });
    return { id: req.id };
  },

  async getPendingPasswordResets(channelId?: string): Promise<{
    id: string; userId: string; userName: string; userEmail: string;
    channelId: string; requestedAt: string; expiresAt: string; status: string;
  }[]> {
    const now = new Date();
    // Auto-expire overdue requests
    await prisma.passwordResetRequest.updateMany({
      where: { status: "pending", expiresAt: { lt: now } },
      data: { status: "expired" },
    });
    const reqs = await prisma.passwordResetRequest.findMany({
      where: { status: "pending", ...(channelId ? { channelId } : {}) },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { requestedAt: "desc" },
    });
    return reqs.map((r) => ({
      id: r.id, userId: r.userId, channelId: r.channelId,
      userName: r.user.name, userEmail: r.user.email,
      requestedAt: r.requestedAt.toISOString(), expiresAt: r.expiresAt.toISOString(),
      status: r.status,
    }));
  },

  async fulfillPasswordResetRequest(requestId: string, newPassword: string): Promise<boolean> {
    const req = await prisma.passwordResetRequest.findUnique({ where: { id: requestId } });
    if (!req || req.status !== "pending" || req.expiresAt < new Date()) return false;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await Promise.all([
      prisma.user.update({ where: { id: req.userId }, data: { passwordHash } }),
      prisma.passwordResetRequest.update({ where: { id: requestId }, data: { status: "fulfilled" } }),
    ]);
    return true;
  },

  async updateUserTraining(userId: string, data: {
    quizPassed?: boolean; lensActivated?: boolean; trainingDone?: boolean; completedModules?: number[];
  }): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id: userId }, data });
      return mapUser(u);
    } catch { return null; }
  },

  /* ── Profile ────────────────────────────────────────────────────────── */
  async updateUserProfile(userId: string, data: { name?: string; displayName?: string; avatarUrl?: string; country?: string }): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id: userId }, data });
      return mapUser(u);
    } catch { return null; }
  },

  /* ── Activity log ───────────────────────────────────────────────── */
  async logActivity(userId: string, data: { type: string; title: string; detail?: string; amount?: number }): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId, type: data.type, title: data.title,
          detail: data.detail ?? "", amount: data.amount ?? null,
        },
      });
    } catch { /* non-fatal — never throw on logging */ }
  },

  async getActivityLogs(userId: string, opts?: { search?: string; type?: string; limit?: number; offset?: number }) {
    const where = {
      userId,
      ...(opts?.type ? { type: opts.type } : {}),
      ...(opts?.search ? {
        OR: [
          { title: { contains: opts.search, mode: "insensitive" as const } },
          { detail: { contains: opts.search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where, orderBy: { createdAt: "desc" },
        take: opts?.limit ?? 50, skip: opts?.offset ?? 0,
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { logs, total };
  },

  async clearActivityLogs(userId: string): Promise<void> {
    await prisma.activityLog.deleteMany({ where: { userId } });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) return { ok: false, error: "User not found" };
    const valid = user.passwordHash.startsWith("$2")
      ? await bcrypt.compare(currentPassword, user.passwordHash)
      : user.passwordHash === currentPassword;
    if (!valid) return { ok: false, error: "Current password is incorrect" };
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  },

  async saveUserBank(userId: string, data: { bankCode: string; bankName: string; bankAccountNumber: string; bankAccountName: string }): Promise<AdminUser | null> {
    try {
      const u = await prisma.user.update({ where: { id: userId }, data });
      return mapUser(u);
    } catch { return null; }
  },

  /* ── Jobs / Payments / Referrals ────────────────────────────────────── */
  async submitUserJob(userId: string, data: {
    type: string; batchId: string; accuracy: number;
  }): Promise<{
    status: "approved" | "rejected"; earnings: number; reason: string;
    newSalary: number; newJobsDone: number; newJobsToday: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, salary: true, jobsDone: true, jobsToday: true, lastJobDate: true },
    });
    if (!user) throw new Error("User not found");

    const isNewDay = user.lastJobDate !== today;
    const currentJobsToday = isNewDay ? 0 : user.jobsToday;

    // Daily limit check
    if (currentJobsToday >= 15) {
      return {
        status: "rejected", earnings: 0,
        reason: "Daily work limit reached (15/15). Come back tomorrow.",
        newSalary: user.salary, newJobsDone: user.jobsDone, newJobsToday: currentJobsToday,
      };
    }

    const acc = Math.max(0, Math.min(100, data.accuracy));
    let jobStatus: "Approved" | "Rejected";
    let earnings: number;
    let reason: string;

    if (acc < 60) {
      jobStatus = "Rejected"; earnings = 0;
      reason = `Accuracy too low (${acc.toFixed(1)}%) — minimum 60%. No payout for this job.`;
    } else {
      // Linear scale: 60% → $1.20, 100% → $2.50
      earnings = Math.round((1.20 + ((acc - 60) / 40) * 1.30) * 100) / 100;
      if (acc >= 99) { earnings = 2.50; reason = `Accuracy: ${acc.toFixed(1)}% — Full payout ($2.50)`; }
      else reason = `Accuracy: ${acc.toFixed(1)}% — Partial payout ($${earnings.toFixed(2)})`;
      jobStatus = "Approved";
    }

    const newJobsToday = currentJobsToday + 1;
    const [updated] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(jobStatus === "Approved" ? { salary: { increment: earnings }, jobsDone: { increment: 1 } } : {}),
          jobsToday: newJobsToday, lastJobDate: today,
        },
      }),
      prisma.job.create({
        data: {
          id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId, userName: user.name,
          type: data.type, batchId: data.batchId,
          status: jobStatus, earnings, accuracy: acc,
        },
      }),
    ]);
    return {
      status: jobStatus === "Approved" ? "approved" : "rejected", earnings, reason,
      newSalary: updated.salary, newJobsDone: updated.jobsDone, newJobsToday,
    };
  },

  async getJobById(id: string): Promise<Job | null> {
    const j = await prisma.job.findUnique({ where: { id } });
    if (!j) return null;
    return { id: j.id, userId: j.userId, userName: j.userName, type: j.type as Job["type"],
             batchId: j.batchId, status: j.status as Job["status"], earnings: j.earnings,
             submittedAt: j.submittedAt instanceof Date ? j.submittedAt.toISOString() : j.submittedAt,
             accuracy: j.accuracy };
  },

  async updateJobStatus(id: string, status: string): Promise<Job | null> {
    try {
      const j = await prisma.job.update({ where: { id }, data: { status } });
      return { id: j.id, userId: j.userId, userName: j.userName, type: j.type as Job["type"],
               batchId: j.batchId, status: j.status as Job["status"], earnings: j.earnings,
               submittedAt: j.submittedAt instanceof Date ? j.submittedAt.toISOString() : j.submittedAt,
               accuracy: j.accuracy };
    } catch { return null; }
  },

  async getPaymentById(id: string): Promise<Payment | null> {
    const p = await prisma.payment.findUnique({ where: { id } });
    if (!p) return null;
    return { id: p.id, userId: p.userId, userName: p.userName, amount: p.amount,
             method: p.method as Payment["method"], status: p.status as Payment["status"],
             date: p.date, ref: p.ref };
  },

  async updatePaymentStatus(id: string, status: string): Promise<Payment | null> {
    try {
      const p = await prisma.payment.update({ where: { id }, data: { status } });
      return { id: p.id, userId: p.userId, userName: p.userName, amount: p.amount,
               method: p.method as Payment["method"], status: p.status as Payment["status"],
               date: p.date, ref: p.ref };
    } catch { return null; }
  },

  async getAllJobs(): Promise<Job[]> {
    const jobs = await prisma.job.findMany({ orderBy: { submittedAt: "desc" } });
    return jobs.map((j) => ({
      id: j.id, userId: j.userId, userName: j.userName,
      type: j.type as Job["type"], batchId: j.batchId,
      status: j.status as Job["status"], earnings: j.earnings,
      submittedAt: j.submittedAt instanceof Date ? j.submittedAt.toISOString() : j.submittedAt,
      accuracy: j.accuracy,
    }));
  },

  async getAllPayments(): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({ orderBy: { date: "desc" } });
    return payments.map((p) => ({
      id: p.id, userId: p.userId, userName: p.userName, amount: p.amount,
      method: p.method as Payment["method"], status: p.status as Payment["status"],
      date: p.date, ref: p.ref,
    }));
  },

  async getAllReferrals(): Promise<Referral[]> {
    const refs = await prisma.referral.findMany();
    return refs.map((r) => ({
      id: r.id, referrerId: r.referrerId, referrerName: r.referrerName,
      recruitName: r.recruitName, recruitEmail: r.recruitEmail,
      status: r.status as Referral["status"], bonusEarned: r.bonusEarned, joinedAt: r.joinedAt,
    }));
  },

  /* ── Referral bonuses ───────────────────────────────────────────────── */
  async getReferralBonuses(channelId: string): Promise<ReferralBonus[]> {
    const bonuses = await prisma.referralBonus.findMany({ where: { channelId }, orderBy: { createdAt: "desc" } });
    return bonuses.map(mapReferralBonus);
  },

  async getAllReferralBonuses(): Promise<ReferralBonus[]> {
    const bonuses = await prisma.referralBonus.findMany({ orderBy: { createdAt: "desc" } });
    return bonuses.map(mapReferralBonus);
  },

  async claimReferralBonus(bonusId: string): Promise<ReferralBonus | null> {
    const b = await prisma.referralBonus.findUnique({ where: { id: bonusId } });
    if (!b || b.status !== "pending") return null;
    const netAmount = await this._deductSuperAdminCommission(b.amount);
    const updated = await prisma.referralBonus.update({
      where: { id: bonusId },
      data: { status: "claimed", claimedAt: new Date() },
    });
    await prisma.user.update({ where: { id: b.referrerId }, data: { recruitWallet: { increment: netAmount } } });
    return mapReferralBonus(updated);
  },

  async autoProcessExpiredBonuses(): Promise<void> {
    const now = new Date();
    const expired = await prisma.referralBonus.findMany({
      where: { status: "pending", autoCreditsAt: { lte: now } },
    });
    for (const b of expired) {
      const netAmount = await this._deductSuperAdminCommission(b.amount);
      await prisma.referralBonus.update({
        where: { id: b.id },
        data: { status: "auto-credited", claimedAt: now },
      });
      await prisma.user.update({ where: { id: b.referrerId }, data: { recruitWallet: { increment: netAmount } } });
    }
  },

  async createReferralBonusForRegistration(recruitUserId: string, channelId: string): Promise<void> {
    const recruit = await prisma.user.findUnique({ where: { id: recruitUserId } });
    if (!recruit?.referredByUserId) return;
    const referrer = await prisma.user.findUnique({ where: { id: recruit.referredByUserId } });
    if (!referrer) return;
    const ch = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!ch) return;
    const bonusAmount = (ch.jobPassFee * ch.referralCommissionRate) / 100;
    const autoCreditsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.referralBonus.create({
      data: {
        id: `rb-${Date.now()}`, channelId, referrerId: referrer.id,
        referrerName: referrer.name, referrerEmail: referrer.email,
        recruitEmail: recruit.email, recruitName: recruit.name,
        amount: bonusAmount, status: "pending", autoCreditsAt,
      },
    });
  },

  /* ── Settings ───────────────────────────────────────────────────────── */
  async getSettings(): Promise<PlatformSettings> {
    const s = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
    return {
      registrationOpen: s.registrationOpen, maintenanceMode: s.maintenanceMode,
      payoutsEnabled: s.payoutsEnabled, newJobsEnabled: s.newJobsEnabled, announcement: s.announcement,
      commissionEnabled: s.commissionEnabled ?? false,
      commissionWallet: s.commissionWallet ?? 0,
      leaderboardThreshold: s.leaderboardThreshold ?? 0,
    };
  },

  async updateSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const s = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    return {
      registrationOpen: s.registrationOpen, maintenanceMode: s.maintenanceMode,
      payoutsEnabled: s.payoutsEnabled, newJobsEnabled: s.newJobsEnabled, announcement: s.announcement,
      commissionEnabled: s.commissionEnabled ?? false,
      commissionWallet: s.commissionWallet ?? 0,
      leaderboardThreshold: s.leaderboardThreshold ?? 0,
    };
  },

  async resetPlatform(): Promise<{ deletedJobs: number; deletedLogs: number; deletedPayments: number; deletedReferrals: number; deletedBonuses: number; deletedCommissions: number; usersReset: number }> {
    // Must delete child records before dependent ones (foreign key order)
    const [jobsResult, logsResult, paymentsResult, referralsResult, bonusesResult, commissionsResult] = await Promise.all([
      prisma.job.deleteMany({}),
      prisma.activityLog.deleteMany({}),
      prisma.payment.deleteMany({}),
      prisma.referral.deleteMany({}),
      prisma.referralBonus.deleteMany({}),
      prisma.channelCommission.deleteMany({}),
    ]);

    // Reset all user earnings and stats
    const usersResult = await prisma.user.updateMany({
      where: { is_super_admin: false },
      data: {
        salary: 0, recruitWallet: 0,
        jobsDone: 0, accuracy: 0, streak: 0, jobsToday: 0, lastJobDate: "",
        quizPassed: false, lensActivated: false, trainingDone: false, completedModules: [],
      },
    });

    // Reset channel balances and platform commission wallet
    await Promise.all([
      prisma.channel.updateMany({ data: { balance: 0 } }),
      prisma.platformSettings.upsert({
        where: { id: "singleton" },
        update: { commissionWallet: 0 },
        create: { id: "singleton", commissionWallet: 0 },
      }),
    ]);

    return {
      deletedJobs:         jobsResult.count,
      deletedLogs:         logsResult.count,
      deletedPayments:     paymentsResult.count,
      deletedReferrals:    referralsResult.count,
      deletedBonuses:      bonusesResult.count,
      deletedCommissions:  commissionsResult.count,
      usersReset:          usersResult.count,
    };
  },

  async setAgentAvatar(userId: string, adminAvatarUrl: string | null): Promise<AdminUser | null> {
    const u = await prisma.user.update({ where: { id: userId }, data: { adminAvatarUrl } });
    return u ? mapUser(u) : null;
  },

  async getLeaderboard(threshold = 0): Promise<AdminUser[]> {
    const users = await prisma.user.findMany({
      where: { is_super_admin: false, accountStatus: "approved", salary: { gte: threshold } },
      orderBy: { salary: "desc" },
      take: 50,
    });
    return users.map(mapUser);
  },

  /* ── Stats ──────────────────────────────────────────────────────────── */
  async getStats() {
    const [users, jobs, payments, referrals, subAdmins, channels] = await Promise.all([
      prisma.user.findMany(),
      prisma.job.findMany(),
      prisma.payment.findMany(),
      prisma.referral.findMany(),
      prisma.subAdmin.count(),
      prisma.channel.count(),
    ]);
    const nonSuper       = users.filter((u) => !u.is_super_admin);
    const totalSalaryPaid = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const pendingPayouts  = payments.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);
    return {
      totalUsers:           nonSuper.length,
      activeUsers:          nonSuper.filter((u) => u.status === "Active").length,
      suspendedUsers:       nonSuper.filter((u) => u.status === "Suspended").length,
      permanentStaff:       nonSuper.filter((u) => u.tier === "Permanent").length,
      totalJobs:            jobs.length,
      approvedJobs:         jobs.filter((j) => j.status === "Approved").length,
      pendingJobs:          jobs.filter((j) => j.status === "Pending").length,
      rejectedJobs:         jobs.filter((j) => j.status === "Rejected").length,
      totalSalaryPaid, pendingPayouts,
      totalReferrals:       referrals.length,
      activeReferrals:      referrals.filter((r) => r.status === "Active").length,
      totalSubAdmins:       subAdmins,
      totalChannels:        channels,
      pendingRegistrations: nonSuper.filter((u) => u.accountStatus === "pending").length,
    };
  },
};
