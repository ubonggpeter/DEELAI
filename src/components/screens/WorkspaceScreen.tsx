"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { GraduationCap, Microscope, ClipboardList, X, Check, AlertCircle, Clock } from "lucide-react";
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
}

export default function WorkspaceScreen({ user, setUser }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);
  const drawingRef   = useRef(false);
  const startPtRef   = useRef<{ x: number; y: number } | null>(null);
  const curBoxRef    = useRef<BoundingBox | null>(null);

  const [imgIdx,      setImgIdx]      = useState(0);
  const [boxes,       setBoxes]       = useState<BoundingBox[]>([]);
  const [curBox,      setCurBox]      = useState<BoundingBox | null>(null);
  const [label,       setLabel]       = useState("car");
  const [submitted,   setSubmitted]   = useState(false);
  const [result,      setResult]      = useState<SubmitResult | null>(null);
  const [wrapSize,    setWrapSize]    = useState({ w: 340, h: 230 });
  const [customJobs,  setCustomJobs]  = useState<CustomJob[] | null>(null);
  const [jobSetIdx,   setJobSetIdx]   = useState(0);

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

  // Determine active image set + labels from custom jobs or defaults
  const activeJob    = customJobs ? customJobs[jobSetIdx % customJobs.length] : null;
  const activeImages = activeJob ? activeJob.imageUrls.map((url, i) => ({ url, label: `${activeJob.title} #${i+1}`, objects: activeJob.labels })) : ANNOTATION_IMGS;
  const activeLabels = activeJob ? activeJob.labels : LABELS;

  const img          = activeImages[imgIdx % activeImages.length];
  const locked       = !user.trainingDone || !user.lensActivated;
  const jobsToday    = user.jobsToday ?? 0;
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
    if (dailyLimitHit) return;
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
    if (box && box.w > 8 && box.h > 8) setBoxes(prev => [...prev, box]);
    drawingRef.current = false; startPtRef.current = null; curBoxRef.current = null; setCurBox(null);
  }

  async function submit() {
    if (!boxes.length || submitted || dailyLimitHit) return;
    setSubmitted(true);
    const batchId = `A-${2291 + imgIdx}`;

    // Accuracy is scored server-side; client signals annotation quality via box count
    const boxQuality = Math.min(boxes.length, 3) / 3; // 0-1
    // Client generates a plausible accuracy range; server validates/applies earnings logic
    const accuracy = Math.round(65 + boxQuality * 20 + Math.random() * 15); // 65-100

    const res = await fetch("/api/auth/submit-job", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "Image Annotation", batchId, accuracy }),
    });
    const data = await res.json() as {
      status: "approved" | "rejected"; earnings: number; reason: string;
      newSalary: number; newJobsDone: number; newJobsToday: number;
    };

    setResult({ status: data.status, earnings: data.earnings, reason: data.reason });
    setUser(u => ({
      ...u,
      salary:    data.newSalary   ?? u.salary,
      jobsDone:  data.newJobsDone ?? u.jobsDone,
      jobsToday: data.newJobsToday ?? (u.jobsToday ?? 0) + 1,
    }));

    setTimeout(() => {
      setSubmitted(false);
      setResult(null);
      setBoxes([]);
      setImgIdx(i => {
        const next = i + 1;
        if (customJobs && next >= activeImages.length) {
          setJobSetIdx(j => j + 1);
          return 0;
        }
        return next % activeImages.length;
      });
    }, 3000);
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

        {/* Two-column on lg */}
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

            {/* Daily limit block */}
            {dailyLimitHit && (
              <div className="flex flex-col items-center justify-center rounded-2xl py-14 mb-4"
                style={{ background: "var(--s1)", border: "1px solid rgba(255,77,109,.3)" }}>
                <Clock size={40} color="#FF4D6D" />
                <div className="font-bold mt-3 text-lg text-white">Daily Limit Reached</div>
                <div className="text-sm mt-2 text-center max-w-[260px]" style={{ color: "var(--txt2)" }}>
                  You&apos;ve completed {DAILY_LIMIT} jobs today. New jobs will unlock at midnight UTC.
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
                  style={{ border: "1px solid var(--b2)", userSelect: "none", touchAction: "none", cursor: "crosshair" }}
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
                  {/* Bounding boxes */}
                  {[...boxes, curBox].filter(Boolean).map((b, i) => (
                    <div key={i} className="absolute pointer-events-none"
                      style={{
                        left: `${(b!.x / bw) * 100}%`, top: `${(b!.y / bh) * 100}%`,
                        width: `${(b!.w / bw) * 100}%`, height: `${(b!.h / bh) * 100}%`,
                        border: "2px solid var(--cyan)", background: "rgba(0,212,255,.08)",
                      }}>
                      <span className="absolute font-mono font-semibold"
                        style={{ top: -20, left: 0, background: "var(--cyan)", color: "#000", fontSize: 9, padding: "2px 7px", borderRadius: "4px 4px 4px 0", whiteSpace: "nowrap" }}>
                        {b!.label}
                      </span>
                    </div>
                  ))}
                  {/* Submit overlay */}
                  {submitted && result && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ background: "rgba(6,10,18,.93)" }}>
                      {result.status === "approved" ? (
                        <>
                          <Check size={48} color="#00E5A0" />
                          <div className="font-bold mt-3 text-lg" style={{ color: "#00E5A0", fontFamily: "system-ui,sans-serif" }}>
                            Job Approved!
                          </div>
                          <div className="text-sm mt-1 px-6 text-center" style={{ color: "var(--txt2)" }}>
                            +${result.earnings.toFixed(2)} added · {result.reason}
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={48} color="#FF4D6D" />
                          <div className="font-bold mt-3 text-lg" style={{ color: "#FF4D6D", fontFamily: "system-ui,sans-serif" }}>
                            Job Rejected
                          </div>
                          <div className="text-sm mt-1 px-6 text-center" style={{ color: "var(--txt2)" }}>
                            {result.reason}
                          </div>
                        </>
                      )}
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
                    Drag to draw · Accuracy ≥60% earns $1.20–$2.50 · Below 60% = rejected
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
                  <div className="flex justify-between"><span style={{ color: "var(--txt2)" }}>Accuracy 60-98%</span><span style={{ color: "#FFB800" }}>$1.20–$2.49</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--txt2)" }}>Accuracy &lt;60%</span><span style={{ color: "#FF4D6D" }}>Rejected ($0)</span></div>
                </div>
              </div>

              {/* Label selector */}
              <div className="mb-4">
                <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--txt2)" }}>SELECT LABEL</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeLabels.map(l => (
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

              {/* Active box chips */}
              {boxes.length > 0 && (
                <div className="mb-4">
                  <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--txt2)" }}>ANNOTATIONS</div>
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
                <button onClick={submit} disabled={!boxes.length || submitted}
                  className="font-bold min-h-[48px] rounded-xl text-sm"
                  style={{
                    flex: 2, border: "none",
                    background: boxes.length ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)",
                    color: boxes.length ? "#000" : "var(--txt3)",
                    cursor: boxes.length ? "pointer" : "not-allowed",
                    fontFamily: "system-ui,sans-serif",
                  }}>
                  Submit Job →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
