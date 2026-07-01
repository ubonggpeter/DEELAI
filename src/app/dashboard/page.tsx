"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Screen, Notification } from "@/lib/types";
import { NOTIFS } from "@/lib/data";
import dynamic from "next/dynamic";

const Onboarding      = dynamic(() => import("@/components/screens/Onboarding"),      { ssr: false });
const AgentBoard      = dynamic(() => import("@/components/screens/AgentBoard"),       { ssr: false });
const Sidebar         = dynamic(() => import("@/components/layout/Sidebar"),           { ssr: false });
const BottomNav       = dynamic(() => import("@/components/layout/BottomNav"),         { ssr: false });
const SlideMenu       = dynamic(() => import("@/components/layout/SlideMenu"),         { ssr: false });
const ActivityScreen  = dynamic(() => import("@/components/screens/ActivityScreen"),   { ssr: false });
const TrainingScreen  = dynamic(() => import("@/components/screens/TrainingScreen"),   { ssr: false });
const WorkspaceScreen = dynamic(() => import("@/components/screens/WorkspaceScreen"),  { ssr: false });
const RecruitScreen   = dynamic(() => import("@/components/screens/RecruitScreen"),    { ssr: false });
const WalletScreen    = dynamic(() => import("@/components/screens/WalletScreen"),     { ssr: false });
const NotificationsScreen = dynamic(() => import("@/components/screens/NotificationsScreen"), { ssr: false });
const ProfileScreen   = dynamic(() => import("@/components/screens/ProfileScreen"),    { ssr: false });
const LeaderboardScreen = dynamic(() => import("@/components/screens/LeaderboardScreen"), { ssr: false });
const TierScreen      = dynamic(() => import("@/components/screens/TierScreen"),       { ssr: false });
const KYCScreen       = dynamic(() => import("@/components/screens/KYCScreen"),        { ssr: false });
const PayoutScreen    = dynamic(() => import("@/components/screens/PayoutScreen"),     { ssr: false });
const SettingsScreen  = dynamic(() => import("@/components/screens/SettingsScreen"),   { ssr: false });
const TermsScreen     = dynamic(() => import("@/components/screens/TermsScreen"),      { ssr: false });
const SupportScreen   = dynamic(() => import("@/components/screens/SupportScreen"),    { ssr: false });

const MAIN_SCREENS: Screen[] = ["activity", "training", "workspace", "recruit", "wallet"];

interface SessionData {
  loggedIn:      boolean;
  userId?:       string;
  email?:        string;
  name?:         string;
  phone?:        string;
  accountStatus?: string;
  salary?:       number;
  jobsDone?:     number;
  level?:        string;
}

export default function Dashboard() {
  const router  = useRouter();
  const [authReady,   setAuthReady]   = useState(false);
  const [session,     setSession]     = useState<SessionData | null>(null);
  const [showOnboard, setShowOnboard] = useState(false);
  const [showBoard,   setShowBoard]   = useState(false);
  const [screen,      setScreen]      = useState<Screen>("activity");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [notifs,      setNotifs]      = useState<Notification[]>(NOTIFS);
  const [user,        setUser]        = useState<User>({
    name:"", level:"ASSOCIATE STAFF", isPermanent:false, salary:0,
    accuracy:0, jobsDone:0, rank:999, hoursLeft:3, streak:0, jobsToday:0,
    refCode:"NEW-0001", completedModules:[], quizPassed:false,
    trainingDone:false, lensActivated:false, kycDone:false,
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (!data.loggedIn) { router.push("/login"); return; }
        if (data.accountStatus === "pending" || data.accountStatus === "rejected") {
          router.push("/register/verify"); return;
        }
        setSession(data);
        // Hydrate user state from session
        setUser((u) => ({
          ...u,
          name:        data.name    ?? u.name,
          email:       data.email   ?? "",
          level:       data.level   ?? u.level,
          salary:      data.salary  ?? u.salary,
          jobsDone:    data.jobsDone ?? u.jobsDone,
          isPermanent: (data.level ?? "").includes("PERMANENT"),
        }));
        setAuthReady(true);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const notifCount = notifs.filter((n) => !n.read).length;

  if (!authReady) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:32, height:32, border:"3px solid #00D4FF33", borderTopColor:"#00D4FF", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (showOnboard) return <Onboarding onDone={() => { setShowOnboard(false); setShowBoard(true); }} />;
  if (showBoard)   return <AgentBoard  onActivate={() => setShowBoard(false)} />;

  const isMain = MAIN_SCREENS.includes(screen);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar
        screen={screen}
        setScreen={setScreen}
        user={user}
        notifCount={notifCount}
        onMenuOpen={() => setMenuOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: isMain ? undefined : 0 }}>
          <ScreenContent
            screen={screen} user={user} setUser={setUser}
            notifs={notifs} setNotifs={setNotifs} notifCount={notifCount}
            setScreen={setScreen} setMenuOpen={setMenuOpen}
            goBack={() => setScreen("activity")}
          />
        </div>
        {isMain && <BottomNav screen={screen} setScreen={setScreen} />}
      </div>
      <SlideMenu
        user={user} open={menuOpen}
        onClose={() => setMenuOpen(false)}
        setScreen={setScreen}
        onLogout={handleLogout}
      />
    </div>
  );
}

interface ContentProps {
  screen: Screen; user: User;
  setUser: (fn: (u: User) => User) => void;
  notifs: Notification[]; setNotifs: (n: Notification[]) => void;
  notifCount: number; setScreen: (s: Screen) => void;
  setMenuOpen: (v: boolean) => void; goBack: () => void;
}

function ScreenContent({ screen, user, setUser, notifs, setNotifs, notifCount, setScreen, setMenuOpen, goBack }: ContentProps) {
  switch (screen) {
    case "activity":       return <ActivityScreen     user={user} setScreen={setScreen} notifCount={notifCount} setMenuOpen={setMenuOpen} />;
    case "training":       return <TrainingScreen     user={user} setUser={setUser} />;
    case "workspace":      return <WorkspaceScreen    user={user} setUser={setUser} />;
    case "recruit":        return <RecruitScreen      user={user} />;
    case "wallet":         return <WalletScreen       user={user} setUser={setUser} />;
    case "notifications":  return <NotificationsScreen notifs={notifs} setNotifs={setNotifs} onBack={goBack} />;
    case "profile":        return <ProfileScreen      user={user} onBack={goBack} />;
    case "leaderboard":    return <LeaderboardScreen  onBack={goBack} />;
    case "tier":           return <TierScreen         user={user} onBack={goBack} />;
    case "kyc":            return <KYCScreen          user={user} setUser={setUser} onBack={goBack} />;
    case "payout":         return <PayoutScreen       onBack={goBack} />;
    case "settings":       return <SettingsScreen     onBack={goBack} />;
    case "terms":          return <TermsScreen        onBack={goBack} />;
    case "support":        return <SupportScreen      onBack={goBack} />;
    default:               return null;
  }
}
