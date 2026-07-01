"use client";
import { useState } from "react";
import { User, Screen, Notification } from "@/lib/types";
import { NOTIFS } from "@/lib/data";

// Lazy imports to avoid SSR issues with canvas
import dynamic from "next/dynamic";

const Onboarding = dynamic(() => import("@/components/screens/Onboarding"), { ssr: false });
const AgentBoard = dynamic(() => import("@/components/screens/AgentBoard"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/layout/BottomNav"), { ssr: false });
const SlideMenu = dynamic(() => import("@/components/layout/SlideMenu"), { ssr: false });
const ActivityScreen = dynamic(() => import("@/components/screens/ActivityScreen"), { ssr: false });
const TrainingScreen = dynamic(() => import("@/components/screens/TrainingScreen"), { ssr: false });
const WorkspaceScreen = dynamic(() => import("@/components/screens/WorkspaceScreen"), { ssr: false });
const RecruitScreen = dynamic(() => import("@/components/screens/RecruitScreen"), { ssr: false });
const WalletScreen = dynamic(() => import("@/components/screens/WalletScreen"), { ssr: false });
const NotificationsScreen = dynamic(() => import("@/components/screens/NotificationsScreen"), { ssr: false });
const ProfileScreen = dynamic(() => import("@/components/screens/ProfileScreen"), { ssr: false });
const LeaderboardScreen = dynamic(() => import("@/components/screens/LeaderboardScreen"), { ssr: false });
const TierScreen = dynamic(() => import("@/components/screens/TierScreen"), { ssr: false });
const KYCScreen = dynamic(() => import("@/components/screens/KYCScreen"), { ssr: false });
const PayoutScreen = dynamic(() => import("@/components/screens/PayoutScreen"), { ssr: false });
const SettingsScreen = dynamic(() => import("@/components/screens/SettingsScreen"), { ssr: false });
const TermsScreen = dynamic(() => import("@/components/screens/TermsScreen"), { ssr: false });
const SupportScreen = dynamic(() => import("@/components/screens/SupportScreen"), { ssr: false });

const DEFAULT_USER: User = {
  name: "New Member",
  level: "ASSOCIATE STAFF",
  isPermanent: false,
  salary: 0.0,
  accuracy: 0,
  jobsDone: 0,
  rank: 999,
  hoursLeft: 3,
  streak: 0,
  jobsToday: 0,
  refCode: "NEW-0001",
  completedModules: [],
  quizPassed: false,
  trainingDone: false,
  lensActivated: false,
  kycDone: false,
};

const MAIN_SCREENS: Screen[] = ["activity", "training", "workspace", "recruit", "wallet"];

export default function Home() {
  const [showOnboard, setShowOnboard] = useState(true);
  const [showBoard, setShowBoard] = useState(false);
  const [screen, setScreen] = useState<Screen>("activity");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(NOTIFS);
  const [user, setUser] = useState<User>(DEFAULT_USER);

  const notifCount = notifs.filter((n) => !n.read).length;

  function goBack() {
    setScreen("activity");
  }

  if (showOnboard) {
    return (
      <Onboarding
        onDone={() => {
          setShowOnboard(false);
          setShowBoard(true);
        }}
      />
    );
  }

  if (showBoard) {
    return <AgentBoard onActivate={() => setShowBoard(false)} />;
  }

  return (
    <div
      className="relative mx-auto flex flex-col overflow-hidden"
      style={{
        maxWidth: 430,
        height: "100dvh",
        background: "var(--bg)",
      }}
    >
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: MAIN_SCREENS.includes(screen) ? 72 : 0 }}
      >
        {screen === "activity" && (
          <ActivityScreen
            user={user}
            setScreen={setScreen}
            notifCount={notifCount}
            setMenuOpen={setMenuOpen}
          />
        )}
        {screen === "training" && (
          <TrainingScreen user={user} setUser={setUser} />
        )}
        {screen === "workspace" && (
          <WorkspaceScreen user={user} setUser={setUser} />
        )}
        {screen === "recruit" && <RecruitScreen user={user} />}
        {screen === "wallet" && (
          <WalletScreen user={user} setUser={setUser} />
        )}
        {screen === "notifications" && (
          <NotificationsScreen
            notifs={notifs}
            setNotifs={setNotifs}
            onBack={goBack}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen user={user} onBack={goBack} />
        )}
        {screen === "leaderboard" && (
          <LeaderboardScreen onBack={goBack} />
        )}
        {screen === "tier" && (
          <TierScreen user={user} onBack={goBack} />
        )}
        {screen === "kyc" && (
          <KYCScreen user={user} setUser={setUser} onBack={goBack} />
        )}
        {screen === "payout" && <PayoutScreen onBack={goBack} />}
        {screen === "settings" && <SettingsScreen onBack={goBack} />}
        {screen === "terms" && <TermsScreen onBack={goBack} />}
        {screen === "support" && <SupportScreen onBack={goBack} />}
      </div>

      {MAIN_SCREENS.includes(screen) && (
        <BottomNav screen={screen} setScreen={setScreen} />
      )}

      <SlideMenu
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        setScreen={setScreen}
      />
    </div>
  );
}
