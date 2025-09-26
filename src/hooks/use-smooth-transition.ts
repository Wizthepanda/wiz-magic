import { useCallback, useRef, useState } from 'react';

interface SmoothTransitionOptions {
  duration?: number;
  easing?: (t: number) => number;
}

export function useSmoothTransition(options: SmoothTransitionOptions = {}) {
  const { duration = 300, easing = (t) => t * (2 - t) } = options; // ease-out by default
  const [isTransitioning, setIsTransitioning] = useState(false);
  const rafIdRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const startTransition = useCallback((callback?: () => void) => {
    if (isTransitioning) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    }

    setIsTransitioning(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
        callback?.();
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [duration, easing, isTransitioning]);

  const cancelTransition = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = undefined;
    }
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    startTransition,
    cancelTransition
  };
}

// Advanced version with value interpolation
export function useSmoothValue<T>(
  initialValue: T,
  interpolate: (from: T, to: T, progress: number) => T,
  options: SmoothTransitionOptions = {}
) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [targetValue, setTargetValue] = useState(initialValue);
  const { isTransitioning, startTransition, cancelTransition } = useSmoothTransition(options);

  const fromValueRef = useRef(initialValue);

  const animateToValue = useCallback((newValue: T) => {
    if (JSON.stringify(newValue) === JSON.stringify(targetValue)) return;

    fromValueRef.current = currentValue;
    setTargetValue(newValue);

    const { duration = 300, easing = (t) => t * (2 - t) } = options;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const interpolatedValue = interpolate(fromValueRef.current, newValue, easedProgress);
      setCurrentValue(interpolatedValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    startTransition();
    requestAnimationFrame(animate);
  }, [currentValue, targetValue, options, interpolate, startTransition]);

  return {
    value: currentValue,
    targetValue,
    isTransitioning,
    animateToValue,
    cancelTransition
  };
}