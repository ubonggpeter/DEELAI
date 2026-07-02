export interface User {
  name: string;
  email?: string;
  channelId?: string;
  level: string;
  isPermanent: boolean;
  salary: number;
  accuracy: number;
  jobsDone: number;
  rank: number;
  hoursLeft: number;
  streak: number;
  jobsToday: number;
  refCode: string;
  completedModules: number[];
  quizPassed: boolean;
  trainingDone: boolean;
  lensActivated: boolean;
  kycDone: boolean;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  color: string;
  type: string;
}

export interface Agent {
  name: string;
  city: string;
  status: "active" | "duty" | "available";
}

export interface Region {
  id: string;
  name: string;
  color: string;
  agents: Agent[];
}

export type Screen =
  | "activity"
  | "training"
  | "workspace"
  | "recruit"
  | "wallet"
  | "notifications"
  | "profile"
  | "leaderboard"
  | "tier"
  | "kyc"
  | "payout"
  | "settings"
  | "terms"
  | "support";

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}
