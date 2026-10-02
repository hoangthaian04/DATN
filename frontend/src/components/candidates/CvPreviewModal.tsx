import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, RefreshCw, X } from 'lucide-react';

import { applicationService } from '@/services/application.service';

interface Props {
  applicationId: number;
  candidateName: string;
  onClose: () => void;
}

export const CvPreviewModal: React.FC<Props> = ({ applicationId, candidateName, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;
    let createdUrl: string | null = null;

    applicationService.getCvPreviewUrl(applicationId)
      .then(url => {
        createdUrl = url;
        if (isCurrent) {
          setPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setErrorMessage('Không thể tải CV PDF. Vui lòng thử lại.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [applicationId, retryKey]);

  const retryPreview = () => {
    setPreviewUrl(null);
    setIsLoading(true);
    setErrorMessage('');
    setRetryKey(value => value + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <section
        className="flex h-[min(88vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-preview-title"
        aria-busy={isLoading}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <h2 id="cv-preview-title" className="truncate text-base font-black text-slate-800">CV của {candidateName}</h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {previewUrl && (
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 sm:inline-flex"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Mở tab mới
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Đóng xem CV"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-slate-100 p-3 sm:p-5">
          {isLoading && (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Đang tải CV...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl bg-white p-6 text-center">
              <p className="mt-3 text-sm font-semibold text-slate-600" role="alert">{errorMessage}</p>
              <button
                type="button"
                onClick={retryPreview}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-primary-600"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Thử lại
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && previewUrl && (
            <iframe
              title={`CV PDF của ${candidateName}`}
              src={previewUrl}
              className="h-full min-h-64 w-full rounded-xl bg-white shadow-sm"
            />
          )}
        </div>
      </section>
    </div>
  );
};
