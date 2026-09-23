import React, { useState } from 'react';
import { X, Send, Wand2, RefreshCw } from 'lucide-react';

interface AIEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  candidateEmail?: string;
  onSend: () => void;
}

export const AIEmailPreviewModal: React.FC<AIEmailPreviewModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  onSend,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState(`Chào ${candidateName},\n\nCảm ơn bạn đã quan tâm và ứng tuyển vào vị trí Fullstack Developer tại EasyTech. Dù hiện tại kỹ năng của bạn chưa hoàn toàn phù hợp với yêu cầu khắt khe về Backend của vị trí này, nhưng chúng tôi cực kỳ ấn tượng với kinh nghiệm Frontend của bạn (đặc biệt là ReactJS và TypeScript).\n\nHệ thống AI của chúng tôi nhận thấy hồ sơ của bạn khớp đến 92% với vị trí Frontend Developer mà chúng tôi đang mở tuyển. Môi trường tại team Frontend rất năng động và có nhiều cơ hội để bạn phát huy tối đa thế mạnh của mình.\n\nBạn có muốn chuyển hồ sơ sang ứng tuyển vị trí này không? Vui lòng xác nhận bằng cách bấm vào nút bên dưới.\n\nTrân trọng,\nPhòng Tuyển dụng EasyTech`);

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setContent(`Xin chào ${candidateName},\n\nEasyTech rất trân trọng thời gian bạn dành để ứng tuyển vị trí Fullstack Developer. Tuy kinh nghiệm Backend của bạn chưa thật sự khớp với kỳ vọng của chúng tôi ở thời điểm này, nhưng nền tảng Frontend của bạn lại vô cùng nổi bật!\n\nChúng tôi đang tìm kiếm một Frontend Developer và nhận thấy bạn chính là ứng viên sáng giá (Match 92%).\n\nNếu bạn vẫn đang tìm kiếm cơ hội mới và hứng thú với vị trí Frontend, hãy cho chúng tôi biết bằng cách click xác nhận nhé.\n\nThân mến,\nĐội ngũ Nhân sự EasyTech`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[60] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Soạn Email Mời Ứng Tuyển</h2>
              <p className="text-xs font-semibold text-slate-500">Được viết tự động bởi AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-1">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 w-12">Đến:</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {candidateName} &lt;{candidateEmail || 'candidate@email.com'}&gt;
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 w-12">Tiêu đề:</span>
              <input
                type="text"
                defaultValue={`[EasyTech] Cơ hội vị trí Frontend Developer dành cho ${candidateName}`}
                className="flex-1 text-sm font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div className="p-4 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 text-sm text-slate-700 focus:outline-none resize-none leading-relaxed"
                disabled={isGenerating}
              />
              
              {/* Fake CTA Button visual inside email */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-center">
                <button className="px-6 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-lg opacity-80 cursor-not-allowed">
                  Tìm hiểu & Xác nhận ứng tuyển (Link Tự Động)
                </button>
              </div>

              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mb-2" />
                  <p className="text-sm font-bold text-slate-600">AI đang viết lại email...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
              Viết lại bằng giọng văn khác
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSend}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-sm shadow-primary-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
            Gửi Email & Kết Thúc
          </button>
        </div>
      </div>
    </>
  );
};
