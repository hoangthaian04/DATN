import React, { useState } from 'react';


export interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  jobTitle: string;
  matchScore: number;
  // Khớp với applications.status trong DB
  status: 'NEW' | 'IN_PROGRESS' | 'PASSED' | 'REJECTED' | 'HIRED';
  currentRound: number;
  totalRounds: number;
  submittedAt: string;
  cvUrl?: string;
  // Khớp với application_round_statuses.status trong DB
  roundHistory: {
    roundIndex: number;
    roundName: string;
    result: 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';
    date?: string;
  }[];
}

interface CandidateDrawerProps {
  isOpen: boolean;
  candidate: CandidateData | null;
  onClose: () => void;
  onPass?: (id: string) => void;
  onFail?: (id: string) => void;
  onInitiateFail?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onAISuggest?: (id: string) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  isOpen,
  candidate,
  onClose,
  onPass,
  onFail,
  onInitiateFail,
  onSchedule,
  onAISuggest,
}) => {
  const [activeSection, setActiveSection] = useState<'info' | 'ai'>('info');
  const [aiSubTab, setAiSubTab] = useState<'cv' | 'interview' | 'analysis'>('analysis');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!candidate) return null;

  // scoreColor was here but removed because it is unused

  const statusMap = {
    NEW: { label: 'Mới', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    IN_PROGRESS: { label: 'Đang xử lý', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    PASSED: { label: 'Đạt', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    REJECTED: { label: 'Không đạt', cls: 'bg-red-50 text-red-500 border-red-100' },
    HIRED: { label: 'Đã tuyển', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
  };

  const statusInfo = statusMap[candidate.status] ?? { label: candidate.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-[900px] max-w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">{candidate.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 font-semibold truncate max-w-[180px]">{candidate.jobTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-6 mt-5 border-b border-slate-100 shrink-0">
          {(['info', 'ai'] as const).map((sec) => {
            const labels = { info: 'Thông tin', ai: 'AI Gợi ý' };
            return (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeSection === sec
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {labels[sec]}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeSection === 'info' && (
            <>
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thông tin liên hệ</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-bold">Họ và tên</p>
                      <p className="text-sm font-normal text-slate-600 truncate mt-0.5">{candidate.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-bold">Email</p>
                      <p className="text-sm font-normal text-slate-600 truncate mt-0.5">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-700 font-bold">Số điện thoại</p>
                      <p className="text-sm font-normal text-slate-600 mt-0.5">{candidate.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-700 font-bold">Ngày nộp hồ sơ</p>
                      <p className="text-sm font-normal text-slate-600 mt-0.5">{candidate.submittedAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Download */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hồ sơ đính kèm</h4>
                <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-500/10 border border-primary-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-500">CV</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">CV_{candidate.name.replace(/\s/g, '_')}.pdf</p>
                      <p className="text-[10px] text-slate-400 font-semibold">PDF · 2.4 MB</p>
                    </div>
                  </div>
                  <a
                    href={candidate.cvUrl || '#'}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>

              {/* Progress Rounds info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiến trình vòng</p>
                  <span className="text-xs font-extrabold text-slate-700">
                    {candidate.currentRound}/{candidate.totalRounds}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: candidate.totalRounds }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        i < candidate.currentRound
                          ? 'bg-primary-500'
                          : i === candidate.currentRound
                          ? 'bg-primary-200 animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-slate-400 mt-2">
                  Đang ở Vòng {candidate.currentRound + 1} / {candidate.totalRounds}
                </p>
              </div>
            </>
          )}

          {activeSection === 'ai' && (
            <div className="flex flex-col h-full bg-slate-50 -mx-6 -my-5 px-6 py-5">
              {/* Sub-tabs header */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
                {[
                  { id: 'cv', label: 'Phân tích CV' },
                  { id: 'interview', label: 'Phỏng vấn' },
                  { id: 'analysis', label: 'Phân tích ứng viên' },
                ].map((tab) => {
                  const isActive = aiSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAiSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                          : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>



              {/* TAB CONTENT: Phân tích CV */}
              {aiSubTab === 'cv' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 h-full">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 mb-4">Học vấn & Chứng chỉ</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-primary-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <p className="text-xs font-bold text-slate-800">Cử nhân Công nghệ Thông tin</p>
                          <p className="text-[10px] font-semibold text-slate-500">Đại học Bách Khoa TP.HCM (2018 - 2022)</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1">GPA: 3.8/4.0</p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-primary-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <p className="text-xs font-bold text-slate-800">AWS Certified Solutions Architect</p>
                          <p className="text-[10px] font-semibold text-slate-500">Amazon Web Services (2023)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 mb-3">Kỹ năng trích xuất (Skills)</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Java', 'Spring Boot', 'ReactJS', 'AWS', 'Docker', 'Kubernetes', 'MySQL', 'Redis'].map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Interview */}
              {aiSubTab === 'interview' && (
                <div className="flex gap-5 h-[500px]">
                  {/* Left: Player & Upload */}
                  <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center">
                      <p className="text-sm font-bold text-slate-800 mb-1">Cập nhật âm thanh</p>
                      <p className="text-[10px] text-slate-500 text-center mb-4 px-2">
                        Tải lên file âm thanh (MP3, WAV) hoặc ghi âm trực tiếp tại đây
                      </p>
                      <div className="flex flex-col gap-2 w-full">
                         <button className="w-full py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-bold hover:bg-primary-100 border border-primary-200 cursor-pointer">
                           Ghi âm trực tiếp
                         </button>
                         <button className="w-full py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600 cursor-pointer">
                           Tải file lên
                         </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center shrink-0">
                      <p className="text-xs font-bold text-slate-800">Technical_Interview_T1.mp3</p>
                      <p className="text-[10px] font-semibold text-slate-400">45:20 • Recorded on Oct 12, 2026</p>
                      
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600 cursor-pointer">
                          {isPlaying ? 'Tạm dừng' : 'Phát'}
                        </button>
                      </div>
                      <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-1/3" />
                      </div>
                      <div className="flex justify-between mt-1 px-1">
                         <span className="text-[9px] text-slate-400">15:10</span>
                         <span className="text-[9px] text-slate-400">45:20</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Transcript */}
                  <div className="w-2/3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-extrabold text-slate-800">Transcript (Bóc băng AI)</h4>
                      <div className="relative">
                        <input type="text" placeholder="Tìm từ khóa..." className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-primary-500 w-40" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">HR</div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold mb-0.5">14:05</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">Bạn có thể chia sẻ về một thử thách khó nhất bạn từng gặp khi thiết kế hệ thống Backend không?</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 font-bold text-[10px] flex items-center justify-center shrink-0">UV</div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold mb-0.5">14:20</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-amber-50 px-3 py-2 rounded-xl rounded-tl-none border border-amber-100">
                            Vâng, tại dự án trước, hệ thống gặp tình trạng bottleneck khi lượng request tăng đột biến lên <span className="bg-yellow-200 text-yellow-900 px-1 rounded font-bold cursor-help" title="Kinh nghiệm tối ưu hiệu năng">50,000 rps</span>. Lúc đó, giải pháp của em là implement <span className="bg-yellow-200 text-yellow-900 px-1 rounded font-bold cursor-help" title="Kỹ năng Redis">Redis Caching</span> ở tầng API Gateway và chia nhỏ một monolith service thành 3 <span className="bg-yellow-200 text-yellow-900 px-1 rounded font-bold cursor-help" title="Kiến trúc hệ thống">Microservices</span> chạy trên Kubernetes...
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">HR</div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold mb-0.5">15:10</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">Tuyệt vời, vậy bạn xử lý vấn đề data consistency giữa các service đó như thế nào?</p>
                        </div>
                      </div>
                      {/* Active playing line */}
                      <div className="flex gap-3 relative">
                        <div className="absolute -left-2 top-2 h-2 w-2 rounded-full bg-primary-500 animate-ping" />
                        <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 font-bold text-[10px] flex items-center justify-center shrink-0">UV</div>
                        <div>
                          <p className="text-[9px] text-primary-500 font-bold mb-0.5">15:15</p>
                          <p className="text-xs text-slate-900 leading-relaxed font-bold bg-white px-3 py-2 rounded-xl rounded-tl-none border-2 border-primary-500 shadow-sm">
                            Em sử dụng pattern Saga kết hợp với Kafka để đảm bảo eventual consistency...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Analysis */}
              {aiSubTab === 'analysis' && (
                <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                    <h4 className="text-sm font-extrabold text-slate-800 mb-2">Phân tích ứng viên tổng thể</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Dựa trên kết quả phỏng vấn và CV, ứng viên thể hiện tốt kiến thức nền tảng và kỹ năng giải quyết vấn đề. Phù hợp với định hướng phát triển của team, tuy nhiên cần thêm thời gian để làm quen với một số công nghệ đặc thù của dự án.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-5 shrink-0">
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
                        Điểm mạnh
                      </h4>
                      <ul className="space-y-3">
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-emerald-500 font-bold mr-2">+</span> Nắm vững kiến trúc hệ thống và quy trình phát triển.</li>
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-emerald-500 font-bold mr-2">+</span> Giao tiếp tự tin, diễn đạt ý tưởng kỹ thuật rõ ràng.</li>
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-emerald-500 font-bold mr-2">+</span> Tư duy logic tốt, tiếp thu nhanh công nghệ mới.</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
                        Điểm yếu
                      </h4>
                      <ul className="space-y-3">
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-red-500 font-bold mr-2">-</span> Chưa có nhiều kinh nghiệm thực tế triển khai hệ thống lớn.</li>
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-red-500 font-bold mr-2">-</span> Khả năng sử dụng tiếng Anh chuyên ngành cần cải thiện.</li>
                        <li className="text-xs font-semibold text-slate-700 leading-relaxed"><span className="text-red-500 font-bold mr-2">-</span> Thiếu kinh nghiệm quản lý rủi ro trong dự án.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white shrink-0 space-y-3">
          {/* Pass / Fail */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onPass?.(candidate.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              ĐẠT vòng này
            </button>
            <button
              onClick={() => onInitiateFail ? onInitiateFail(candidate.id) : onFail?.(candidate.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              TRƯỢT
            </button>
          </div>
          {/* Schedule / AI */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSchedule?.(candidate.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Đặt lịch PV
            </button>
            <button
              onClick={() => {
                setActiveSection('ai');
                onAISuggest?.(candidate.id);
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-bold transition-all cursor-pointer"
            >
              AI Gợi ý
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
