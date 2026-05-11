'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ siteKey, onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector('script[data-turnstile]');
    if (existingScript) {
      existingScript.addEventListener('load', renderWidget);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-turnstile', 'true');
    script.onload = renderWidget;
    document.body.appendChild(script);
  }, [siteKey, onVerify]);

  return <div ref={containerRef} />;
}
