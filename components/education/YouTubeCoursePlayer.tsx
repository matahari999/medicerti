'use client';

import { useEffect, useRef } from 'react';

/**
 * YouTube 미등록/공개 영상을 재생하고, 끝까지 시청하면 onEnded()를 호출합니다.
 * IFrame Player API로 재생 종료(ENDED)를 감지해 진도율 100% 처리에 사용됩니다.
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  });

  return apiPromise;
}

interface Props {
  videoId: string;
  onEnded: () => void;
}

export default function YouTubeCoursePlayer({ videoId, onEnded }: Props) {
  // React가 관리하는 바깥 div. YT는 안쪽 target을 iframe으로 교체하므로
  // React 언마운트 시 노드 충돌을 피할 수 있다.
  const targetRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    endedRef.current = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !targetRef.current) return;
      playerRef.current = new window.YT.Player(targetRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED && !endedRef.current) {
              endedRef.current = true;
              onEnded();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
    };
    // videoId가 바뀔 때만 재생성
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={targetRef} className="w-full h-full" />
    </div>
  );
}
