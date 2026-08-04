import { useEffect, useState } from 'react';

// Web replacement for the mobile ring (react-native-svg + Reanimated) —
// same CSS-transition technique as Habits' ProgressRing.jsx, just always
// showing a centered 0-100 score number instead of children.
export function DreamScoreRing({ score = 0, size = 96, strokeWidth = 8, color = '#7c3aed' }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const trackColor = isDark ? '#334155' : '#e5e7eb';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score)) / 100;

  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedProgress(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
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
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(score)}</span>
        <span className="text-[10px] font-medium uppercase text-gray-400 dark:text-gray-500">Score</span>
      </div>
    </div>
  );
}
