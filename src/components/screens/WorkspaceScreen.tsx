"use client";
import { useState, useRef, useEffect } from "react";
import { GraduationCap, Microscope, ClipboardList, X, Check } from "lucide-react";
import { ANNOTATION_IMGS, LABELS } from "@/lib/data";
import { User, BoundingBox } from "@/lib/types";
import LiveDot from "@/components/atoms/LiveDot";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

export default function WorkspaceScreen({ user, setUser }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drawingRef = useRef(false);
  const startPtRef = useRef<{ x: number; y: number } | null>(null);
  const curBoxRef = useRef<BoundingBox | null>(null);

  const [imgIdx, setImgIdx] = useState(0);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [curBox, setCurBox] = useState<BoundingBox | null>(null);
  const [label, setLabel] = useState("car");
  const [submitted, setSubmitted] = useState(false);
  const [wrapSize, setWrapSize] = useState({ w: 340, h: 230 });

  const img = ANNOTATION_IMGS[imgIdx];
  const locked = !user.trainingDone || !user.lensActivated;

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
    e.preventDefault();
    const p = getPos(e);
    drawingRef.current = true;
    startPtRef.current = p;
    curBoxRef.current = null;
    setCurBox(null);
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawingRef.current || !startPtRef.current) return;
    const p = getPos(e), sp = startPtRef.current;
    const box: BoundingBox = {
      x: Math.min(p.x, sp.x), y: Math.min(p.y, sp.y),
      w: Math.abs(p.x - sp.x), h: Math.abs(p.y - sp.y), label,
    };
    curBoxRef.current = box;
    setCurBox({ ...box });
  }

  function onUp(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const box = curBoxRef.current;
    if (box && box.w > 8 && box.h > 8) setBoxes(prev => [...prev, box]);
    drawingRef.current = false;
    startPtRef.current = null;
    curBoxRef.current = null;
    setCurBox(null);
  }

  function submit() {
    if (!boxes.length) return;
    setSubmitted(true);
    setUser(u => ({ ...u, salary: u.salary + 12.5, jobsDone: u.jobsDone + 1, jobsToday: (u.jobsToday || 0) + 1 }));
    setTimeout(() => {
      setSubmitted(false);
      setBoxes([]);
      setImgIdx(i => (i + 1) % ANNOTATION_IMGS.length);
    }, 2200);
  }

  if (locked) return (
    <div style={{ padding: "40px 18px", textAlign: "center" }} className="animate-fadeUp">
      <div
        className="flex items-center justify-center mx-auto mb-4"
        style={{ width: 80, height: 80, borderRadius: 24, background: "var(--s1)", border: "1px solid var(--b2)" }}
      >
        <GraduationCap size={40} color="var(--cyan)" />
      </div>
      <div
        className="font-black mb-2.5"
        style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}
      >
        Training Required
      </div>
      <div style={{ fontSize: 14, color: "var(--txt2)", lineHeight: 1.7 }}>
        Complete all modules and pass the certification quiz to unlock live jobs.
      </div>
    </div>
  );

  const { w: bw, h: bh } = wrapSize;

  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div
        className="flex justify-between items-center"
        style={{ padding: "20px 18px 14px", borderBottom: "1px solid var(--b1)" }}
      >
        <div>
          <div className="font-black" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 18 }}>
            Annotation Workspace
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>
            Job #{1220 + imgIdx} · {img.label}
          </div>
        </div>
        <div
          className="flex items-center gap-1 font-mono font-semibold"
          style={{
            background: "rgba(0,229,160,.1)", border: "1px solid rgba(0,229,160,.3)",
            borderRadius: 8, padding: "5px 11px", fontSize: 11, color: "#00E5A0",
          }}
        >
          <LiveDot />$12.50 / job
        </div>
      </div>

      {/* Daily limit */}
      {!user.isPermanent && (
        <div
          className="flex items-center gap-2 mx-[18px] mt-2.5"
          style={{ background: "rgba(255,184,0,.07)", border: "1px solid rgba(255,184,0,.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#FFB800" }}
        >
          Daily limit: {user.jobsToday || 0}/15 jobs completed today
        </div>
      )}

      {/* Lens banner */}
      <div
        className="flex items-center gap-2 mx-[18px] mt-2.5"
        style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 10, padding: "8px 14px" }}
      >
        <Microscope size={15} color="var(--cyan)" />
        <span className="font-semibold" style={{ fontSize: 12, color: "var(--cyan)" }}>Annotation Lens Active</span>
        <span className="ml-auto font-mono" style={{ fontSize: 10, color: "var(--txt2)" }}>QUALITY MODE: ON</span>
      </div>

      {/* Label selector */}
      <div style={{ padding: "10px 18px 12px", borderBottom: "1px solid var(--b1)" }}>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 1, marginBottom: 8 }}>
          SELECT LABEL
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LABELS.map(l => (
            <button
              key={l}
              onClick={() => setLabel(l)}
              className="transition-all font-mono"
              style={{
                padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${label === l ? "var(--cyan)" : "var(--b2)"}`,
                background: label === l ? "var(--cyan-d)" : "var(--s2)",
                color: label === l ? "var(--cyan)" : "var(--txt2)",
                fontSize: 11, cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Drawing area */}
      <div
        ref={wrapRef}
        className="relative select-none"
        style={{
          margin: "14px 18px",
          borderRadius: 14, overflow: "hidden",
          border: "1px solid var(--b2)",
          userSelect: "none", touchAction: "none",
          cursor: "crosshair",
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={img.url}
          alt={img.label}
          crossOrigin="anonymous"
          style={{ width: "100%", display: "block", borderRadius: 14 }}
          onLoad={() => {
            if (imgRef.current) setWrapSize({ w: imgRef.current.offsetWidth, h: imgRef.current.offsetHeight });
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,212,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.05) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
            borderRadius: 14,
          }}
        />
        {/* Bounding boxes */}
        {[...boxes, curBox].filter(Boolean).map((b, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${((b!.x / bw) * 100)}%`,
              top: `${((b!.y / bh) * 100)}%`,
              width: `${((b!.w / bw) * 100)}%`,
              height: `${((b!.h / bh) * 100)}%`,
              border: "2px solid var(--cyan)",
              background: "rgba(0,212,255,.08)",
            }}
          >
            <span
              className="absolute font-mono font-semibold"
              style={{
                top: -20, left: 0, background: "var(--cyan)", color: "#000",
                fontSize: 9, padding: "2px 7px",
                borderRadius: "4px 4px 4px 0", whiteSpace: "nowrap",
              }}
            >
              {b!.label}
            </span>
          </div>
        ))}
        {/* Submit overlay */}
        {submitted && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ background: "rgba(6,10,18,.93)", borderRadius: 14 }}
          >
            <Check size={44} color="#00E5A0" />
            <div
              className="font-bold mt-2.5"
              style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 18, color: "#00E5A0" }}
            >
              Job Approved!
            </div>
            <div style={{ fontSize: 13, color: "var(--txt2)", marginTop: 4 }}>+$12.50 added to your salary</div>
          </div>
        )}
      </div>

      {/* Annotate note */}
      <div style={{ padding: "0 18px", marginBottom: 10 }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--txt2)", marginBottom: 4 }}>
          <ClipboardList size={14} />
          <strong style={{ color: "#fff" }}>Annotate:</strong>{" "}
          <em style={{ color: "var(--cyan)" }}>{img.objects.join(", ")}</em>
        </div>
        <div style={{ fontSize: 11, color: "var(--txt3)" }}>Drag on the image to draw a box · Select a label first</div>
      </div>

      {/* Active box chips */}
      {boxes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-[18px] mb-2.5">
          {boxes.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 font-mono"
              style={{
                background: "var(--cyan-d)", border: "1px solid var(--cyan)",
                color: "var(--cyan)", borderRadius: 6, padding: "3px 10px", fontSize: 11,
              }}
            >
              {b.label}
              <X
                size={10}
                className="cursor-pointer opacity-60"
                onClick={() => setBoxes(boxes.filter((_, idx) => idx !== i))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 px-[18px] pb-7">
        <button
          onClick={() => setBoxes([])}
          className="flex-1 font-semibold"
          style={{
            padding: "13px", borderRadius: 10,
            border: "1px solid var(--b2)", background: "var(--s1)",
            color: "var(--txt2)", cursor: "pointer", fontSize: 14,
          }}
        >
          Clear
        </button>
        <button
          onClick={submit}
          disabled={!boxes.length || submitted}
          className="font-bold"
          style={{
            flex: 2, padding: "13px", borderRadius: 10, border: "none",
            background: boxes.length ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)",
            color: boxes.length ? "#000" : "var(--txt3)",
            cursor: boxes.length ? "pointer" : "not-allowed",
            fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 14,
          }}
        >
          Submit Job (+$12.50) →
        </button>
      </div>
    </div>
  );
}
