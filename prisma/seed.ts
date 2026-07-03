import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "mentormedia4sure@gmail.com";
const SUPER_ADMIN_HASH  = "$2b$10$d8zVAan.H5kJ3NlHzRr1RuaGDEbutlUf8Ts3sUplnlWNdZC9rCTOG";

async function main() {
  console.log("Seeding Supabase database...");

  // Pre-hash demo passwords once
  const [demoHash, adminHash] = await Promise.all([
    bcrypt.hash("demo1234",  10),
    bcrypt.hash("admin1234", 10),
  ]);

  /* ── Sub-admins ── */
  await prisma.subAdmin.upsert({ where: { id: "sa-seed-1" }, update: {}, create: { id: "sa-seed-1", email: "channel.a@deelai.uk", name: "Channel A Admin", region: "West Africa",   permissions: ["manage_users","manage_jobs","manage_payments","manage_referrals","view_reports"], createdBy: SUPER_ADMIN_EMAIL } });
  await prisma.subAdmin.upsert({ where: { id: "sa-seed-2" }, update: {}, create: { id: "sa-seed-2", email: "channel.b@deelai.uk", name: "Channel B Admin", region: "East Africa",   permissions: ["manage_users","manage_jobs","view_reports"],                                      createdBy: SUPER_ADMIN_EMAIL } });
  await prisma.subAdmin.upsert({ where: { id: "sa-seed-3" }, update: {}, create: { id: "sa-seed-3", email: "channel.c@deelai.uk", name: "Channel C Admin", region: "North America", permissions: ["manage_users","manage_payments","view_reports"],                                   createdBy: SUPER_ADMIN_EMAIL } });
  console.log("✓ Sub-admins");

  /* ── Channels ── */
  await prisma.channel.upsert({ where: { id: "ch-a" }, update: {}, create: { id: "ch-a", ownerEmail: "channel.a@deelai.uk", channelName: "A", description: "Full-time positions for dedicated remote workers. Competitive pay with daily payouts and fast-track approval.", estTime: "2 min", referralCommissionRate: 10, jobPassFee: 25, isActive: true, balance: 125, region: "West Africa" } });
  await prisma.channel.upsert({ where: { id: "ch-b" }, update: {}, create: { id: "ch-b", ownerEmail: "channel.b@deelai.uk", channelName: "B", description: "Flexible part-time schedule. Perfect for students and anyone looking to earn on their own timetable.", estTime: "5 min", referralCommissionRate: 12, jobPassFee: 20, isActive: true, balance: 84,  region: "East Africa" } });
  await prisma.channel.upsert({ where: { id: "ch-c" }, update: {}, create: { id: "ch-c", ownerEmail: "channel.c@deelai.uk", channelName: "C", description: "Premium channel for experienced data annotators. Higher base pay and exclusive high-value batches.", estTime: "10 min", referralCommissionRate: 15, jobPassFee: 35, isActive: true, balance: 225, region: "North America" } });
  console.log("✓ Channels");

  /* ── Users ── */
  const users = [
    { id:"u0",  email: SUPER_ADMIN_EMAIL,      name:"Super Admin",    level:"SUPER ADMIN",     salary:0,     jobsDone:0,    accuracy:100, streak:0,  tier:"Permanent", status:"Active",    joinedAt:"2025-10-01", country:"NG", is_admin:true,  is_super_admin:true,  admin_permissions:[],                                                                              admin_region:"Global",    channelId:null,  permitType:null,        accountStatus:"approved", jobPassPaid:false, jobPassAmount:0,  refCode:"SADMN00", quizPassed:true,  lensActivated:true,  trainingDone:true,  completedModules:[0,1,2,3,4], passwordHash: SUPER_ADMIN_HASH },
    { id:"u1",  email:"chidi@deelai.uk",       name:"Chidi Okonkwo",  level:"PERMANENT STAFF", salary:18420, jobsDone:1241, accuracy:98.7, streak:42, tier:"Permanent", status:"Active",    joinedAt:"2025-11-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-a",permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:25, refCode:"CHDOK12", quizPassed:true,  lensActivated:true,  trainingDone:true,  completedModules:[0,1,2,3,4], passwordHash: demoHash },
    { id:"u2",  email:"aisha@deelai.uk",       name:"Aisha Mensah",   level:"PERMANENT STAFF", salary:16800, jobsDone:1102, accuracy:98.2, streak:35, tier:"Permanent", status:"Active",    joinedAt:"2025-11-14", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-b",permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:20, refCode:"AISMC34", quizPassed:true,  lensActivated:true,  trainingDone:true,  completedModules:[0,1,2,3,4], passwordHash: demoHash },
    { id:"u3",  email:"kwame@deelai.uk",       name:"Kwame Asante",   level:"PERMANENT STAFF", salary:15990, jobsDone:1044, accuracy:97.9, streak:28, tier:"Permanent", status:"Active",    joinedAt:"2025-11-20", country:"GH", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-a",permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:25, refCode:"KWMAS56", quizPassed:true,  lensActivated:false, trainingDone:false, completedModules:[0,1,2],     passwordHash: demoHash },
    { id:"u4",  email:"amara@deelai.uk",       name:"Amara Osei",     level:"ASSOCIATE STAFF", salary:14750, jobsDone:984,  accuracy:97.4, streak:21, tier:"Associate", status:"Active",    joinedAt:"2025-12-01", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-b",permitType:"part-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:20, refCode:"AMROS78", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[0,1],       passwordHash: demoHash },
    { id:"u5",  email:"fatima@deelai.uk",      name:"Fatima Bello",   level:"ASSOCIATE STAFF", salary:13200, jobsDone:901,  accuracy:96.8, streak:14, tier:"Associate", status:"Active",    joinedAt:"2025-12-05", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-a",permitType:"part-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0,  refCode:"FATBL90", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: demoHash },
    { id:"u6",  email:"emeka@deelai.uk",       name:"Emeka Nwosu",    level:"ASSOCIATE STAFF", salary:12800, jobsDone:876,  accuracy:96.1, streak:10, tier:"Associate", status:"Active",    joinedAt:"2025-12-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-c",permitType:"full-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0,  refCode:"EMKNW23", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: demoHash },
    { id:"u7",  email:"sade@deelai.uk",        name:"Sade Williams",  level:"ASSOCIATE STAFF", salary:11500, jobsDone:820,  accuracy:95.5, streak:7,  tier:"Associate", status:"Active",    joinedAt:"2025-12-15", country:"GB", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-b",permitType:"part-time",  accountStatus:"rejected", jobPassPaid:false, jobPassAmount:0,  refCode:"SADWL45", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: demoHash },
    { id:"u8",  email:"tunde@deelai.uk",       name:"Tunde Adeyemi",  level:"ASSOCIATE STAFF", salary:10900, jobsDone:794,  accuracy:94.9, streak:5,  tier:"Associate", status:"Active",    joinedAt:"2026-01-03", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-a",permitType:"full-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:25, refCode:"TUNDM67", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[0],         passwordHash: demoHash },
    { id:"u9",  email:"gideon@deelai.uk",      name:"Gideon NSE",     level:"ASSOCIATE STAFF", salary:9400,  jobsDone:620,  accuracy:93.2, streak:3,  tier:"Associate", status:"Suspended", joinedAt:"2026-01-10", country:"NG", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-c",permitType:"part-time",  accountStatus:"approved", jobPassPaid:true,  jobPassAmount:35, refCode:"GIDON89", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: demoHash },
    { id:"u10", email:"ravi@deelai.uk",        name:"Ravi Sharma",    level:"ASSOCIATE STAFF", salary:8750,  jobsDone:540,  accuracy:92.8, streak:0,  tier:"Associate", status:"Active",    joinedAt:"2026-01-18", country:"IN", is_admin:false, is_super_admin:false, admin_permissions:[],                                                                              admin_region:null,        channelId:"ch-b",permitType:"part-time",  accountStatus:"pending",  jobPassPaid:false, jobPassAmount:0,  refCode:"RAVSH01", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: demoHash },
    { id:"ua1", email:"channel.a@deelai.uk",   name:"Channel A Admin",level:"ASSOCIATE STAFF", salary:0,     jobsDone:0,    accuracy:0,    streak:0,  tier:"Associate", status:"Active",    joinedAt:"2026-01-15", country:"NG", is_admin:true,  is_super_admin:false, admin_permissions:["manage_users","manage_jobs","manage_payments","manage_referrals","view_reports"], admin_region:"West Africa", channelId:"ch-a",permitType:null, accountStatus:"approved", jobPassPaid:false, jobPassAmount:0,  refCode:"ADMNA1", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: adminHash },
    { id:"ua2", email:"channel.b@deelai.uk",   name:"Channel B Admin",level:"ASSOCIATE STAFF", salary:0,     jobsDone:0,    accuracy:0,    streak:0,  tier:"Associate", status:"Active",    joinedAt:"2026-01-20", country:"NG", is_admin:true,  is_super_admin:false, admin_permissions:["manage_users","manage_jobs","view_reports"],                                      admin_region:"East Africa", channelId:"ch-b",permitType:null, accountStatus:"approved", jobPassPaid:false, jobPassAmount:0,  refCode:"ADMNB2", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: adminHash },
    { id:"ua3", email:"channel.c@deelai.uk",   name:"Channel C Admin",level:"ASSOCIATE STAFF", salary:0,     jobsDone:0,    accuracy:0,    streak:0,  tier:"Associate", status:"Active",    joinedAt:"2026-02-01", country:"NG", is_admin:true,  is_super_admin:false, admin_permissions:["manage_users","manage_payments","view_reports"],                                  admin_region:"North America", channelId:"ch-c",permitType:null, accountStatus:"approved", jobPassPaid:false, jobPassAmount:0,  refCode:"ADMNC3", quizPassed:false, lensActivated:false, trainingDone:false, completedModules:[],          passwordHash: adminHash },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id, email: u.email, name: u.name, level: u.level,
        salary: u.salary, jobsDone: u.jobsDone, accuracy: u.accuracy, streak: u.streak,
        tier: u.tier, status: u.status, joinedAt: u.joinedAt, country: u.country,
        is_admin: u.is_admin, is_super_admin: u.is_super_admin,
        admin_permissions: u.admin_permissions, admin_region: u.admin_region,
        channelId: u.channelId, permitType: u.permitType,
        accountStatus: u.accountStatus, jobPassPaid: u.jobPassPaid, jobPassAmount: u.jobPassAmount,
        refCode: u.refCode, quizPassed: u.quizPassed, lensActivated: u.lensActivated,
        trainingDone: u.trainingDone, completedModules: u.completedModules,
        passwordHash: u.passwordHash,
      },
    });
  }
  console.log("✓ Users");

  /* ── Jobs ── */
  const jobs = [
    { id:"j1",  userId:"u1", userName:"Chidi Okonkwo", type:"Image Annotation",     batchId:"A-2291", status:"Approved", earnings:12.50, submittedAt:new Date("2026-07-01T10:02:00Z"), accuracy:99.1 },
    { id:"j2",  userId:"u2", userName:"Aisha Mensah",  type:"Image Annotation",     batchId:"A-2290", status:"Approved", earnings:12.50, submittedAt:new Date("2026-07-01T09:44:00Z"), accuracy:98.7 },
    { id:"j3",  userId:"u3", userName:"Kwame Asante",  type:"Voice Transcription",  batchId:"T-0821", status:"Pending",  earnings:18.00, submittedAt:new Date("2026-07-01T09:10:00Z"), accuracy:0    },
    { id:"j4",  userId:"u4", userName:"Amara Osei",    type:"Image Annotation",     batchId:"A-2289", status:"Approved", earnings:12.50, submittedAt:new Date("2026-06-30T14:22:00Z"), accuracy:97.4 },
    { id:"j5",  userId:"u5", userName:"Fatima Bello",  type:"Content Intelligence", batchId:"C-0442", status:"Rejected", earnings:0,     submittedAt:new Date("2026-06-30T11:55:00Z"), accuracy:62.0 },
    { id:"j6",  userId:"u6", userName:"Emeka Nwosu",   type:"Image Annotation",     batchId:"A-2288", status:"Approved", earnings:12.50, submittedAt:new Date("2026-06-30T08:30:00Z"), accuracy:96.2 },
    { id:"j7",  userId:"u7", userName:"Sade Williams", type:"Image Annotation",     batchId:"A-2287", status:"Approved", earnings:12.50, submittedAt:new Date("2026-06-29T16:45:00Z"), accuracy:95.8 },
    { id:"j8",  userId:"u8", userName:"Tunde Adeyemi", type:"Voice Transcription",  batchId:"T-0820", status:"Pending",  earnings:18.00, submittedAt:new Date("2026-06-29T13:20:00Z"), accuracy:0    },
    { id:"j9",  userId:"u1", userName:"Chidi Okonkwo", type:"Image Annotation",     batchId:"A-2286", status:"Approved", earnings:12.50, submittedAt:new Date("2026-06-29T10:05:00Z"), accuracy:99.3 },
    { id:"j10", userId:"u2", userName:"Aisha Mensah",  type:"Content Intelligence", batchId:"C-0441", status:"Approved", earnings:9.50,  submittedAt:new Date("2026-06-28T15:30:00Z"), accuracy:98.1 },
  ];
  for (const j of jobs) {
    await prisma.job.upsert({ where: { id: j.id }, update: {}, create: j });
  }
  console.log("✓ Jobs");

  /* ── Payments ── */
  const payments = [
    { id:"p1", userId:"u1", userName:"Chidi Okonkwo", amount:184.20, method:"Bank Transfer", status:"Paid",       date:"2026-05-23", ref:"TXN-83920141" },
    { id:"p2", userId:"u2", userName:"Aisha Mensah",  amount:168.00, method:"USDT / Crypto", status:"Paid",       date:"2026-05-23", ref:"TXN-83920142" },
    { id:"p3", userId:"u3", userName:"Kwame Asante",  amount:159.90, method:"Bank Transfer", status:"Paid",       date:"2026-05-23", ref:"TXN-83920143" },
    { id:"p4", userId:"u4", userName:"Amara Osei",    amount:147.50, method:"Bank Transfer", status:"Pending",    date:"2026-06-27", ref:"TXN-83920144" },
    { id:"p5", userId:"u5", userName:"Fatima Bello",  amount:132.00, method:"PayPal",        status:"Processing", date:"2026-06-27", ref:"TXN-83920145" },
    { id:"p6", userId:"u6", userName:"Emeka Nwosu",   amount:128.00, method:"Bank Transfer", status:"Pending",    date:"2026-06-27", ref:"TXN-83920146" },
    { id:"p7", userId:"u7", userName:"Sade Williams", amount:115.00, method:"USDT / Crypto", status:"Paid",       date:"2026-05-16", ref:"TXN-83920147" },
    { id:"p8", userId:"u8", userName:"Tunde Adeyemi", amount:109.00, method:"Bank Transfer", status:"Paid",       date:"2026-05-16", ref:"TXN-83920148" },
  ];
  for (const p of payments) {
    await prisma.payment.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log("✓ Payments");

  /* ── Referrals ── */
  const referrals = [
    { id:"r1", referrerId:"u1", referrerName:"Chidi Okonkwo", recruitName:"Fatima Bello",  recruitEmail:"fatima@deelai.uk", status:"Active",   bonusEarned:240, joinedAt:"2025-12-05" },
    { id:"r2", referrerId:"u1", referrerName:"Chidi Okonkwo", recruitName:"Emeka Nwosu",   recruitEmail:"emeka@deelai.uk",  status:"Active",   bonusEarned:200, joinedAt:"2025-12-10" },
    { id:"r3", referrerId:"u2", referrerName:"Aisha Mensah",  recruitName:"Sade Williams", recruitEmail:"sade@deelai.uk",   status:"Active",   bonusEarned:160, joinedAt:"2025-12-15" },
    { id:"r4", referrerId:"u3", referrerName:"Kwame Asante",  recruitName:"Tunde Adeyemi", recruitEmail:"tunde@deelai.uk",  status:"Active",   bonusEarned:120, joinedAt:"2026-01-03" },
    { id:"r5", referrerId:"u4", referrerName:"Amara Osei",    recruitName:"Gideon NSE",    recruitEmail:"gideon@deelai.uk", status:"Inactive", bonusEarned:40,  joinedAt:"2026-01-10" },
    { id:"r6", referrerId:"u2", referrerName:"Aisha Mensah",  recruitName:"Ravi Sharma",   recruitEmail:"ravi@deelai.uk",   status:"Active",   bonusEarned:80,  joinedAt:"2026-01-18" },
  ];
  for (const r of referrals) {
    await prisma.referral.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log("✓ Referrals");

  /* ── Quiz questions ── */
  const quizQuestions = [
    { id:"q1", q:"What is data annotation?",                       opts:["Labeling raw data for AI training","Writing code for apps","Managing databases","Creating websites"],            ans:0, sortOrder:0 },
    { id:"q2", q:"Which annotation type labels objects in images?", opts:["Bounding box","Audio transcription","Sentiment analysis","Text summarization"],                                ans:0, sortOrder:1 },
    { id:"q3", q:"What does accuracy mean in annotation?",          opts:["Speed of completion","Percentage of correct labels","Number of tasks done","Hours worked"],                    ans:1, sortOrder:2 },
    { id:"q4", q:"A batch with 95% accuracy means:",                opts:["5% of labels may be wrong","95% was completed on time","You earned 95% of the pay","The batch had 95 items"], ans:0, sortOrder:3 },
    { id:"q5", q:"What should you do if unsure about an annotation?",opts:["Skip it","Guess randomly","Use the guidelines or ask","Mark it as done"],                                    ans:2, sortOrder:4 },
    { id:"q6", q:"DEELAI pays workers:",                            opts:["Weekly","Monthly","Daily","Annually"],                                                                         ans:2, sortOrder:5 },
  ];
  for (const q of quizQuestions) {
    await prisma.quizQuestion.upsert({ where: { id: q.id }, update: {}, create: q });
  }
  console.log("✓ Quiz questions");

  /* ── Platform settings ── */
  await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: { id: "singleton", registrationOpen: true, maintenanceMode: false, payoutsEnabled: true, newJobsEnabled: true, announcement: "" },
  });
  console.log("✓ Platform settings");

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
