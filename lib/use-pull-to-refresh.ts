import { useEffect, useRef, useState } from 'react';

interface Options {
  /** Pull distance (px, after resistance) needed to trigger a refresh. */
  threshold?: number;
  /** Disable the gesture entirely (e.g. while already refreshing elsewhere). */
  enabled?: boolean;
}

/**
 * Pull-to-refresh for a *scrollable element* (not the document).
 *
 * The workspace scrolls inside an inner `overflow-y-auto` container, so the
 * browser's native pull-to-refresh never fires. This hook recreates it: when the
 * container is at the top and the user drags down past `threshold`, `onRefresh`
 * runs. Touch-only by design, so it's effectively a mobile gesture.
 *
 * Returns a `ref` to attach to the scroll container plus the live `pull` distance
 * and `refreshing` flag for rendering an indicator.
 */
export function usePullToRefresh<T extends HTMLElement>(
  onRefresh: () => void | Promise<void>,
  { threshold = 70, enabled = true }: Options = {}
) {
  const ref = useRef<T>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Mirror live values into refs so the (long-lived) touch listeners read the
  // current state without re-binding on every change.
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let startY = 0;
    let pulling = false;

    const setDistance = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      // Only arm the gesture when we're already scrolled to the very top.
      if (el.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling || refreshingRef.current) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) {
        // Dragging back up — hand control back to normal scrolling.
        pulling = false;
        setDistance(0);
        return;
      }
      // Rubber-band resistance, capped so it can't be dragged forever.
      setDistance(Math.min(dy * 0.5, threshold * 1.6));
      // Suppress the browser's own overscroll/rubber-band while we pull.
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = async () => {
      if (!pulling) return;
      pulling = false;
      if (pullRef.current >= threshold) {
        refreshingRef.current = true;
        setRefreshing(true);
        setDistance(threshold);
        await onRefreshRef.current();
        // If onRefresh navigates/reloads, the indicator stays up until then.
        refreshingRef.current = false;
        setRefreshing(false);
        setDistance(0);
      } else {
        setDistance(0);
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled, threshold]);

  return { ref, pull, refreshing, threshold };
}
