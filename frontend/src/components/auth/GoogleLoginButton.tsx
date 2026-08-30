import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

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
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle';
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  isLoading = false,
  text,
  mode = 'login',
}) => {
  const googleHiddenBtnRef = useRef<HTMLDivElement>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const buttonText = text || (mode === 'register' ? 'Đăng ký với Google' : 'Đăng nhập với Google');

  useEffect(() => {
    // Tự động nạp Google Identity Services script nếu chưa có
    if (!document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleClient();
      };
      document.head.appendChild(script);
    } else {
      initGoogleClient();
    }
  }, [clientId]);

  const initGoogleClient = () => {
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => {
          if (res.credential) {
            void onSuccess(res.credential);
          }
        },
      });

      if (googleHiddenBtnRef.current) {
        googleHiddenBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleHiddenBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          locale: 'vi',
        });
      }
    }
  };

  const handleButtonClick = () => {
    if (!clientId) {
      setShowConfigModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      // Kích hoạt One Tap prompt hoặc trigger nút Google ẩn
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Nếu One Tap bị chặn bởi trình duyệt, tự động click nút Google ẩn
          const iframeBtn = googleHiddenBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (iframeBtn) {
            iframeBtn.click();
          }
        }
      });

      // Click vào nút iframe của Google nếu có
      const iframeBtn = googleHiddenBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
      if (iframeBtn) {
        iframeBtn.click();
      }
    }
  };

  const handleManualTokenSubmit = async () => {
    if (manualToken.trim()) {
      setShowConfigModal(false);
      await onSuccess(manualToken.trim());
    }
  };

  return (
    <>
      {/* Nút bấm hiển thị đồng nhất giao diện Tailwind đẹp mắt */}
      <div className="w-full relative">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-60 transition duration-150 cursor-pointer"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>{buttonText}</span>
        </button>

        {/* Iframe ẩn của Google để hỗ trợ kích hoạt popup an toàn */}
        <div ref={googleHiddenBtnRef} className="absolute inset-0 opacity-0 pointer-events-none overflow-hidden h-0" />
      </div>

      {/* Modal khi chưa có Client ID */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Google OAuth Login</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Backend API <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-blue-600 font-bold">/api/v1/auth/google</code> đã sẵn sàng xác thực Google ID Token và tự động tạo tài khoản HR/Doanh nghiệp.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nhập Google ID Token để test trực tiếp (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Dán chuỗi JWT ID Token từ Google OAuth vào đây..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              {manualToken.trim() && (
                <button
                  onClick={handleManualTokenSubmit}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  Xác thực ID Token
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
