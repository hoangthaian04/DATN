import React, { useCallback, useEffect, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (idToken: string) => Promise<void>;
  isLoading?: boolean;
  text?: string;
  mode?: 'login' | 'register';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  isLoading = false,
  text = 'Đăng nhập với Google',
  mode = 'login',
}) => {
  const buttonContainer = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const initializeGoogle = useCallback(() => {
    if (!clientId || !window.google?.accounts.id || !buttonContainer.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        if (credential) void onSuccess(credential);
      },
    });
    buttonContainer.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonContainer.current, {
      theme: 'outline',
      size: 'large',
      width: buttonContainer.current.clientWidth || 360,
      text: mode === 'register' ? 'signup_with' : 'signin_with',
      shape: 'rectangular',
      locale: 'vi',
    });
  }, [clientId, mode, onSuccess]);

  useEffect(() => {
    const existingScript = document.getElementById('google-jssdk') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google) initializeGoogle();
      else existingScript.addEventListener('load', initializeGoogle, { once: true });
      return () => existingScript.removeEventListener('load', initializeGoogle);
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', initializeGoogle, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener('load', initializeGoogle);
  }, [initializeGoogle]);

  if (!clientId) {
    return (
      <button type="button" disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400">
        Google OAuth chưa được cấu hình
      </button>
    );
  }

  return (
    <div aria-label={text} className={isLoading ? 'pointer-events-none opacity-60' : ''}>
      <div ref={buttonContainer} className="flex min-h-10 w-full justify-center" />
    </div>
  );
};
