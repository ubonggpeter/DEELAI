"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ChevronRight, Globe2, MapPin, Clock } from "lucide-react";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  cyan: "#00D4FF", green: "#00E5A0", gold: "#FFB800",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

interface Channel {
  id: string;
  channelName: string;
  description: string;
  estTime: string;
  jobPassFee: number;
  region: string;
}

const CHANNEL_COLORS = ["#00D4FF", "#00E5A0", "#FFB800", "#8B5CF6", "#FF4D6D"];

const REGION_TO_CONTINENT: Record<string, string> = {
  "West Africa":    "Africa",    "East Africa":   "Africa",
  "South Africa":   "Africa",    "North Africa":  "Africa",    "Central Africa": "Africa",
  "North America":  "Americas",  "South America": "Americas",
  "Latin America":  "Americas",  "Central America": "Americas",
  "Europe":         "Europe",    "Western Europe": "Europe",
  "Eastern Europe": "Europe",    "Southern Europe": "Europe",
  "Asia":           "Asia Pacific", "South East Asia": "Asia Pacific",
  "South Asia":     "Asia Pacific", "East Asia":       "Asia Pacific",
  "Oceania":        "Asia Pacific", "Pacific":         "Asia Pacific",
  "Middle East":    "Middle East",  "MENA":            "Middle East",
};

const CONTINENT_ORDER = ["Africa", "Americas", "Europe", "Asia Pacific", "Middle East", "Global"];

const CONTINENT_COLOR: Record<string, string> = {
  "Africa":       "#00E5A0",
  "Americas":     "#00D4FF",
  "Europe":       "#8B5CF6",
  "Asia Pacific": "#FFB800",
  "Middle East":  "#FF4D6D",
  "Global":       "#7D8BAA",
};

export default function ChannelList() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((d) => setChannels(d.channels ?? []))
      .finally(() => setLoading(false));
  }, []);

  function selectChannel(id: string) {
    setSelected(id);
    router.push(`/register?channel=${id}`);
  }

  const grouped: Record<string, Channel[]> = {};
  for (const ch of channels) {
    const continent = REGION_TO_CONTINENT[ch.region] ?? ch.region ?? "Global";
    (grouped[continent] ??= []).push(ch);
  }
  const visibleContinents = [
    ...CONTINENT_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CONTINENT_ORDER.includes(c)),
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Loader2 size={30} color={C.cyan} className="spin-icon" />
        <style>{`@keyframes spin-anim{to{transform:rotate(360deg)}} .spin-icon{animation:spin-anim 1s linear infinite}`}</style>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div style={{ textAlign: "center", color: C.txt3, padding: "40px 0" }}>
        No channels are currently open for registration. Check back soon.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {visibleContinents.map((continent) => {
        const cColor = CONTINENT_COLOR[continent] ?? C.txt2;
        const agents = grouped[continent];
        return (
          <div key={continent}>
            {/* Continent header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: `${cColor}18`, border: `1px solid ${cColor}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Globe2 size={13} color={cColor} />
              </div>
              <span style={{ color: C.txt, fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>
                {continent}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, flexShrink: 0,
                background: `${cColor}14`, border: `1px solid ${cColor}30`, color: cColor,
              }}>
                {agents.length} agent{agents.length !== 1 ? "s" : ""}
              </span>
              <div style={{ flex: 1, height: 1, background: C.s3 }} />
            </div>

            {/* Agent rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map((ch, idx) => {
                const color = CHANNEL_COLORS[(CONTINENT_ORDER.indexOf(continent) * 3 + idx) % CHANNEL_COLORS.length];
                const isSel = selected === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => selectChannel(ch.id)}
                    className="agent-row"
                    style={{
                      background: isSel ? `${color}0c` : C.s1,
                      border: `1.5px solid ${isSel ? color : C.s3}`,
                      borderRadius: 12, padding: "14px",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: `${color}18`, border: `1.5px solid ${color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 900, color, fontFamily: "system-ui",
                      overflow: "hidden",
                    }}>
                      {ch.channelName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ color: C.txt, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                          Channel {ch.channelName}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                          background: `${C.green}12`, border: `1px solid ${C.green}30`, color: C.green,
                        }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                          OPEN
                        </span>
                        <span style={{ color: C.txt3, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={9} color={C.txt3} style={{ flexShrink: 0 }} />
                          {ch.region}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                          background: `${C.gold}12`, border: `1px solid ${C.gold}28`, color: C.gold,
                          display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
                        }}>
                          <Clock size={9} /> {ch.estTime} review
                        </span>
                        {ch.jobPassFee > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                            background: `${color}12`, border: `1px solid ${color}28`, color,
                            whiteSpace: "nowrap",
                          }}>
                            ₦{ch.jobPassFee.toLocaleString()} fee
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join button */}
                    <button className="agent-join-btn" style={{
                      background: isSel ? color : `${color}18`,
                      border: `1.5px solid ${color}50`, borderRadius: 8,
                      color: isSel ? "#060A12" : color,
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                      padding: "8px 14px", whiteSpace: "nowrap",
                    }}>
                      {isSel
                        ? <><CheckCircle2 size={13} /> Joined</>
                        : <>Join <ChevronRight size={13} /></>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
