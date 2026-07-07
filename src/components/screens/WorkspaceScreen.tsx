"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { GraduationCap, Microscope, ClipboardList, X, Clock, Star, TrendingUp, ChevronRight } from "lucide-react";
import { ANNOTATION_IMGS, LABELS } from "@/lib/data";
import { User, BoundingBox } from "@/lib/types";
import LiveDot from "@/components/atoms/LiveDot";

interface CustomJob { id: string; title: string; imageUrls: string[]; labels: string[]; difficulty: string; description: string; }

const DAILY_LIMIT = 15;

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

interface SubmitResult {
  status: "approved" | "rejected";
  earnings: number;
  reason: string;
  accuracy: number;
}

type Phase = "annotating" | "submitting" | "result";

export default function WorkspaceScreen({ user, setUser }: Props) {
  const wrapRef     = useRef<HTMLDivElement>(null);
  const imgRef      = useRef<HTMLImageElement>(null);
  const drawingRef  = useRef(false);
  const startPtRef  = useRef<{ x: number; y: number } | null>(null);
  const curBoxRef   = useRef<BoundingBox | null>(null);

  const [imgIdx,     setImgIdx]     = useState(0);
  const [boxes,      setBoxes]      = useState<BoundingBox[]>([]);
  const [curBox,     setCurBox]     = useState<BoundingBox | null>(null);
  const [label,      setLabel]      = useState("car");
  const [phase,      setPhase]      = useState<Phase>("annotating");
  const [result,     setResult]     = useState<SubmitResult | null>(null);
  const [wrapSize,   setWrapSize]   = useState({ w: 340, h: 230 });
  const [customJobs, setCustomJobs] = useState<CustomJob[] | null>(null);
  const [jobSetIdx,  setJobSetIdx]  = useState(0);
  const [autoTimer,  setAutoTimer]  = useState(5);

  const fetchCustomJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/annotation-jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.jobs?.length > 0) setCustomJobs(data.jobs);
      }
    } catch { /* fall back to defaults */ }
  }, []);

  useEffect(() => { fetchCustomJobs(); }, [fetchCustomJobs]);

  // Auto-advance timer on results screen
  useEffect(() => {
    if (phase !== "result") return;
    setAutoTimer(5);
    const tick = setInterval(() => setAutoTimer((t) => t - 1), 1000);
    const done = setTimeout(() => { clearInterval(tick); goNext(); }, 5000);
    return () => { clearInterval(tick); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const activeJob    = customJobs ? customJobs[jobSetIdx % customJobs.length] : null;
  const activeImages = activeJob
    ? activeJob.imageUrls.map((url, i) => ({ url, label: `${activeJob.title} #${i + 1}`, objects: activeJob.labels }))
    : ANNOTATION_IMGS;
  const activeLabels = activeJob ? activeJob.labels : LABELS;

  const img           = activeImages[imgIdx % activeImages.length];
  const locked        = !user.trainingDone || !user.lensActivated;
  const jobsToday     = user.jobsToday ?? 0;
  const dailyLimitHit = jobsToday >= DAILY_LIMIT;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const i = el.querySelector("img") as HTMLImageElement | null;
      if (i && i.offsetHeight) setWrapSize({ w: i.offsetWidth, h: i.offsetHeight });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }

  function onDown(e: React.MouseEvent | React.TouchEvent) {
    if (dailyLimitHit || phase !== "annotating") return;
    e.preventDefault();
    const p = getPos(e);
    drawingRef.current = true; startPtRef.current = p; curBoxRef.current = null; setCurBox(null);
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawingRef.current || !startPtRef.current) return;
    const p = getPos(e), sp = startPtRef.current;
    const box: BoundingBox = {
      x: Math.min(p.x, sp.x), y: Math.min(p.y, sp.y),
      w: Math.abs(p.x - sp.x), h: Math.abs(p.y - sp.y), label,
    };
    curBoxRef.current = box; setCurBox({ ...box });
  }

  function onUp(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const box = curBoxRef.current;
    if (box && box.w > 8 && box.h > 8) setBoxes((prev) => [...prev, box]);
    drawingRef.current = false; startPtRef.current = null; curBoxRef.current = null; setCurBox(null);
  }

  const isValidLabel = (boxLabel: string) =>
    img.objects.some((o) => o.toLowerCase() === boxLabel.toLowerCase());

  async function submit() {
    if (!boxes.length || phase !== "annotating" || dailyLimitHit) return;
    setPhase("submitting");

    const batchId    = `A-${2291 + imgIdx}`;
    const rightBoxes = boxes.filter((b) => isValidLabel(b.label));
    const wrongRatio = boxes.length > 0 ? (boxes.length - rightBoxes.length) / boxes.length : 0;

    // Accuracy: label quality + box count quality + small random factor
    const boxQuality  = Math.min(rightBoxes.length, 3) / 3;
    const labelPenalty = wrongRatio * 30;
    const accuracy    = Math.max(0, Math.round(65 + boxQuality * 20 + Math.random() * 15 - labelPenalty));

    // Always call the API — rejected submissions still consume a daily slot
    const res = await fetch("/api/auth/submit-job", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "Image Annotation", batchId, accuracy }),
    });
    const data = await res.json() as {
      status: "approved" | "rejected"; earnings: number; reason: string;
      newSalary: number; newJobsDone: number; newJobsToday: number;
    };

    setResult({ status: data.status, earnings: data.earnings, reason: data.reason, accuracy });
    setUser((u) => ({
      ...u,
      salary:    data.newSalary    ?? u.salary,
      jobsDone:  data.newJobsDone  ?? u.jobsDone,
      jobsToday: data.newJobsToday ?? (u.jobsToday ?? 0) + 1,
    }));
    setPhase("result");
  }

  function goNext() {
    setPhase("annotating");
    setResult(null);
    setBoxes([]);
    setImgIdx((i) => {
      const next = i + 1;
      if (customJobs && next >= activeImages.length) {
        setJobSetIdx((j) => j + 1);
        return 0;
      }
      return next % activeImages.length;
    });
  }

  if (locked) return (
    <div className="animate-fadeUp min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center px-6 py-10 max-w-sm mx-auto">
        <div className="flex items-center justify-center mx-auto mb-4 rounded-3xl"
          style={{ width: 80, height: 80, background: "var(--s1)", border: "1px solid var(--b2)" }}>
          <GraduationCap size={40} color="var(--cyan)" />
        </div>
        <div className="font-black text-xl sm:text-2xl mb-2.5 text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
          Training Required
        </div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
          Complete all modules and pass the certification quiz to unlock live jobs.
        </div>
      </div>
    </div>
  );

  const { w: bw, h: bh } = wrapSize;

  return (
    <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-5"
          style={{ borderBottom: "1px solid var(--b1)" }}>
          <div>
            <div className="font-black text-base sm:text-lg text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              Annotation Workspace
            </div>
            <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--txt2)" }}>
              Job #{1220 + imgIdx} · {img.label}
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-semibold rounded-xl px-3 py-2"
            style={{ background: "rgba(0,229,160,.1)", border: "1px solid rgba(0,229,160,.3)", fontSize: 11, color: "#00E5A0" }}>
            <LiveDot />$1.20–$2.50 / job
          </div>
        </div>

        {/* Results screen — replaces annotation area after submission */}
        {phase === "result" && result ? (
          <ResultsScreen result={result} autoTimer={autoTimer} onNext={goNext} />
        ) : (
          <div className="flex flex-col lg:flex-row lg:gap-6 px-4 sm:px-6 lg:px-10 py-4">
            {/* Left: drawing area */}
            <div className="flex-1 min-w-0">
              {/* Daily limit bar */}
              <div className="flex items-center gap-2 mb-3 rounded-xl px-3 py-2.5 text-xs"
                style={{
                  background: dailyLimitHit ? "rgba(255,77,109,.1)" : "rgba(255,184,0,.07)",
                  border: `1px solid ${dailyLimitHit ? "rgba(255,77,109,.3)" : "rgba(255,184,0,.2)"}`,
                  color: dailyLimitHit ? "#FF4D6D" : "#FFB800",
                }}>
                {dailyLimitHit
                  ? <><Clock size={13} /> Daily limit reached ({jobsToday}/{DAILY_LIMIT}) — Come back tomorrow</>
                  : <><Clock size={13} /> Daily jobs: {jobsToday}/{DAILY_LIMIT} completed today</>
                }
              </div>

              {dailyLimitHit && (
                <div className="flex flex-col items-center justify-center rounded-2xl py-14 mb-4"
                  style={{ background: "var(--s1)", border: "1px solid rgba(255,77,109,.3)" }}>
                  <Clock size={40} color="#FF4D6D" />
                  <div className="font-bold mt-3 text-lg text-white">Daily Limit Reached</div>
                  <div className="text-sm mt-2 text-center max-w-[260px]" style={{ color: "var(--txt2)" }}>
                    You&apos;ve completed {DAILY_LIMIT} jobs today. New jobs unlock at midnight UTC.
                  </div>
                </div>
              )}

              {!dailyLimitHit && (
                <>
                  {/* Lens banner */}
                  <div className="flex items-center gap-2 mb-3 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.2)" }}>
                    <Microscope size={15} color="var(--cyan)" />
                    <span className="font-semibold text-xs" style={{ color: "var(--cyan)" }}>Annotation Lens Active</span>
                    <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--txt2)" }}>QUALITY MODE: ON</span>
                  </div>

                  {/* Drawing canvas */}
                  <div ref={wrapRef}
                    className="relative select-none w-full rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid var(--b2)", userSelect: "none", touchAction: "none",
                      cursor: phase === "submitting" ? "wait" : "crosshair",
                      opacity: phase === "submitting" ? 0.6 : 1,
                      transition: "opacity 0.2s",
                    }}
                    onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
                    onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={img.url}
                      alt={img.label}
                      crossOrigin="anonymous"
                      className="w-full block"
                      onLoad={() => {
                        if (imgRef.current) setWrapSize({ w: imgRef.current.offsetWidth, h: imgRef.current.offsetHeight });
                      }}
                    />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(rgba(0,212,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.05) 1px,transparent 1px)",
                        backgroundSize: "40px 40px",
                      }} />
                    {/* Bounding boxes — always green/cyan, never red during annotation */}
                    {[...boxes, curBox].filter(Boolean).map((b, i) => {
                      const isDrawing = b === curBox;
                      const color = isDrawing ? "var(--cyan)" : "#00E5A0";
                      const bg    = isDrawing ? "rgba(0,212,255,.08)" : "rgba(0,229,160,.08)";
                      return (
                        <div key={i} className="absolute pointer-events-none"
                          style={{ left:`${(b!.x/bw)*100}%`, top:`${(b!.y/bh)*100}%`, width:`${(b!.w/bw)*100}%`, height:`${(b!.h/bh)*100}%`, border:`2px solid ${color}`, background:bg }}>
                          <span className="absolute font-mono font-semibold"
                            style={{ top:-20, left:0, background:color, color:"#000", fontSize:9, padding:"2px 7px", borderRadius:"4px 4px 4px 0", whiteSpace:"nowrap" }}>
                            {b!.label}
                          </span>
                        </div>
                      );
                    })}

                    {/* Submitting spinner overlay */}
                    {phase === "submitting" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        style={{ background: "rgba(6,10,18,.7)" }}>
                        <div className="font-bold text-sm" style={{ color: "var(--cyan)", fontFamily: "system-ui,sans-serif", animation: "pulse 1s ease-in-out infinite" }}>
                          Grading…
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Annotate note */}
                  <div className="mt-3 mb-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--txt2)" }}>
                      <ClipboardList size={14} />
                      <strong className="text-white">Annotate:</strong>{" "}
                      <em style={{ color: "var(--cyan)" }}>{img.objects.join(", ")}</em>
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--txt3)" }}>
                      Drag to draw bounding boxes · Results shown after submission · Higher accuracy earns more
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: controls */}
            {!dailyLimitHit && (
              <div className="lg:w-72 shrink-0 mt-4 lg:mt-0">
                {/* Earnings info */}
                <div className="mb-4 rounded-xl p-3" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
                  <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--txt2)" }}>PAYOUT SCALE</div>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between"><span style={{ color: "var(--txt2)" }}>Accuracy ≥99%</span><span style={{ color: "#00E5A0" }}>$2.50 (full)</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--txt2)" }}>Accuracy 60–98%</span><span style={{ color: "#FFB800" }}>$1.20–$2.49</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--txt2)" }}>Accuracy &lt;60%</span><span style={{ color: "var(--txt3)" }}>No payout this job</span></div>
                  </div>
                </div>

                {/* Label selector */}
                <div className="mb-4">
                  <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--txt2)" }}>SELECT LABEL</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLabels.map((l) => (
                      <button key={l} onClick={() => setLabel(l)}
                        className="transition-all font-mono min-h-[36px]"
                        style={{
                          padding: "5px 12px", borderRadius: 20,
                          border: `1px solid ${label === l ? "var(--cyan)" : "var(--b2)"}`,
                          background: label === l ? "var(--cyan-d)" : "var(--s2)",
                          color: label === l ? "var(--cyan)" : "var(--txt2)",
                          fontSize: 11, cursor: "pointer",
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active box chips — neutral color, never error state */}
                {boxes.length > 0 && (
                  <div className="mb-4">
                    <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--txt2)" }}>ANNOTATIONS ({boxes.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {boxes.map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5 font-mono"
                          style={{ background: "var(--cyan-d)", border: "1px solid var(--cyan)", color: "var(--cyan)", borderRadius: 6, padding: "3px 10px", fontSize: 11 }}>
                          {b.label}
                          <X size={10} className="cursor-pointer opacity-60" onClick={() => setBoxes(boxes.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 pb-7 lg:pb-0 lg:flex-col">
                  <button onClick={() => setBoxes([])}
                    className="flex-1 lg:flex-none font-semibold min-h-[48px] rounded-xl text-sm"
                    style={{ border: "1px solid var(--b2)", background: "var(--s1)", color: "var(--txt2)", cursor: "pointer" }}>
                    Clear
                  </button>
                  <button onClick={submit} disabled={!boxes.length || phase !== "annotating"}
                    className="font-bold min-h-[48px] rounded-xl text-sm"
                    style={{
                      flex: 2, border: "none",
                      background: boxes.length && phase === "annotating" ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)",
                      color: boxes.length && phase === "annotating" ? "#000" : "var(--txt3)",
                      cursor: boxes.length && phase === "annotating" ? "pointer" : "not-allowed",
                      fontFamily: "system-ui,sans-serif",
                    }}>
                    {phase === "submitting" ? "Grading…" : "Submit Job →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Results screen — shown after every submission, pass or fail */
function ResultsScreen({
  result, autoTimer, onNext,
}: {
  result: SubmitResult; autoTimer: number; onNext: () => void;
}) {
  const passed   = result.status === "approved";
  const accent   = passed ? "#00E5A0" : "#FFB800";
  const accentBg = passed ? "rgba(0,229,160,.1)" : "rgba(255,184,0,.1)";
  const pct      = result.accuracy;

  // Score bar fill, capped visually at 100%
  const barFill = Math.min(100, pct);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8" style={{ animation: "fadeUp 0.35s ease" }}>
      <div className="max-w-sm mx-auto lg:max-w-md">
        {/* Score card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--s1)", border: `1px solid ${accent}40` }}>
          {/* Top band */}
          <div className="px-6 py-5 text-center" style={{ background: accentBg, borderBottom: `1px solid ${accent}30` }}>
            <div className="font-mono text-[11px] tracking-[2px] mb-2" style={{ color: accent }}>
              {passed ? "✓ JOB APPROVED" : "✗ JOB GRADED"}
            </div>
            <div className="font-black" style={{ fontSize: 56, color: accent, lineHeight: 1, fontFamily: "system-ui,sans-serif" }}>
              {pct}%
            </div>
            <div className="font-semibold text-sm mt-1" style={{ color: "var(--txt2)" }}>accuracy score</div>
          </div>

          {/* Accuracy bar */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex justify-between text-[10px] font-mono mb-1.5" style={{ color: "var(--txt3)" }}>
              <span>0%</span><span style={{ color: "#FFB800" }}>60% pass</span><span>100%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: "var(--s3)" }}>
              {/* Pass threshold line */}
              <div className="relative h-full">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barFill}%`,
                    background: pct >= 60
                      ? `linear-gradient(90deg, #FFB800, ${accent})`
                      : "#FF4D6D",
                  }}
                />
                {/* Pass-line marker */}
                <div className="absolute top-0 h-full" style={{ left: "60%", width: 2, background: "rgba(255,184,0,.6)", zIndex:1 }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 flex flex-col gap-3">
            {passed ? (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(0,229,160,.07)", border: "1px solid rgba(0,229,160,.2)" }}>
                <TrendingUp size={18} color="#00E5A0" />
                <div>
                  <div className="font-bold text-base" style={{ color: "#00E5A0" }}>+${result.earnings.toFixed(2)} earned</div>
                  <div className="text-[11px]" style={{ color: "var(--txt3)" }}>{result.reason}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,184,0,.07)", border: "1px solid rgba(255,184,0,.2)" }}>
                <Star size={18} color="#FFB800" />
                <div>
                  <div className="font-bold text-sm" style={{ color: "#FFB800" }}>Keep practicing!</div>
                  <div className="text-[11px]" style={{ color: "var(--txt3)" }}>
                    Aim for 60%+ to earn on each job. This attempt counted toward your daily limit.
                  </div>
                </div>
              </div>
            )}

            {/* Job counted notice */}
            <div className="text-[11px] text-center" style={{ color: "var(--txt3)" }}>
              Job counted toward daily limit · {result.reason}
            </div>
          </div>

          {/* Next job button */}
          <div className="px-6 pb-6">
            <button
              onClick={onNext}
              className="w-full font-bold rounded-xl flex items-center justify-center gap-2"
              style={{
                minHeight: 48, border: "none", fontSize: 14,
                background: `linear-gradient(135deg, ${accent}, ${passed ? "#00B37E" : "#CC9400"})`,
                color: "#000", cursor: "pointer", fontFamily: "system-ui,sans-serif",
              }}
            >
              Next Job <ChevronRight size={16} />
              <span className="font-mono text-[11px] ml-1 opacity-60">({autoTimer}s)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
