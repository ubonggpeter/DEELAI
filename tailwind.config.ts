import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "d-bg": "#060A12",
        "d-s1": "#0C1220",
        "d-s2": "#101829",
        "d-s3": "#162035",
        "d-cyan": "#00D4FF",
        "d-green": "#00E5A0",
        "d-gold": "#FFB800",
        "d-red": "#FF4D6D",
        "d-purple": "#8B5CF6",
        "d-txt": "#EEF2FF",
        "d-txt2": "#7D8BAA",
        "d-txt3": "#4A5470",
      },
      animation: {
        "fadeUp": "fadeUp .4s ease",
        "fadeIn": "fadeIn .4s ease",
        "certIn": "certIn .55s ease",
        "slideRight": "slideRight .3s ease",
        "lensGlow": "lensGlow 2.5s ease-in-out infinite",
        "lensRipple": "lensRipple 2s ease-out infinite",
        "lensRipple2": "lensRipple 2s ease-out infinite .7s",
        "streak": "streak 1.5s ease-in-out infinite",
        "boardPulse": "boardPulse 1.2s ease-in-out infinite",
        "liveBlip": "liveBlipAnim 1.2s ease-in-out infinite",
        "spin-custom": "spin .8s linear infinite",
        "tickerSlide": "tickerSlide .4s ease",
        "rowFade": "rowFade .3s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
