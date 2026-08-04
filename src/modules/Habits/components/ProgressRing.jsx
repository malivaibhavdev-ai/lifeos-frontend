import { useEffect, useState } from 'react';

// Web replacement for the mobile app's react-native-svg + Reanimated ring —
// a single `withTiming` on one value is a textbook CSS transition case, so
// this drops the animation library entirely and animates strokeDashoffset
// via a plain CSS transition instead.
export function ProgressRing({ size = 44, strokeWidth = 4, progress = 0, color = '#2563eb', trackColor, children }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const resolvedTrackColor = trackColor ?? (isDark ? '#334155' : '#e5e7eb');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));

  // Mount at 0 then animate to target on the next frame so the fill-in
  // motion plays on first render too, matching the mobile ring's behavior.
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedProgress(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={resolvedTrackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animatedProgress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>
      {children}
    </div>
  );
}
