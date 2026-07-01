"use client";
import { Star } from "lucide-react";

export default function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={10}
          fill={i < n ? "#FFB800" : "transparent"}
          stroke={i < n ? "#FFB800" : "#4A5470"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
