import { useEffect, useRef, useState } from 'react';

const EASE_OUT = (t) => 1 - (1 - t) ** 3;

// Counts up from 0 to `value` on mount/update instead of snapping straight to
// the final number. Plain rAF loop, same as the mobile version — no motion
// library needed for a one-shot ~600ms mount animation.
export function AnimatedNumber({ value, formatter = (n) => String(Math.round(n)), duration = 600, className, style }) {
  const target = value ?? 0;
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = 0;
    const start = Date.now();
    cancelAnimationFrame(frameRef.current);

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      setDisplay(from + (target - from) * EASE_OUT(t));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return (
    <span className={className} style={style}>
      {formatter(display)}
    </span>
  );
}
