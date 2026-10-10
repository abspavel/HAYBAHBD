import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Trash2, X, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'delete' | 'info';

interface AdminNotificationProps {
  message: string | null;
  type?: NotificationType;
  onClose: () => void;
  duration?: number;
}

export const AdminNotification: React.FC<AdminNotificationProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getTheme = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-950/95',
          border: 'border-red-500',
          text: 'text-white',
          iconColor: 'text-red-400',
          icon: AlertCircle,
          glow: 'shadow-[0_10px_30px_rgba(239,68,68,0.35)]',
          badge: 'bg-red-900/60 text-red-200 border-red-500/40',
        };
      case 'delete':
        return {
          bg: 'bg-[#181010]/95',
          border: 'border-amber-600/80',
          text: 'text-amber-100',
          iconColor: 'text-amber-400',
          icon: Trash2,
          glow: 'shadow-[0_10px_30px_rgba(217,119,6,0.3)]',
          badge: 'bg-amber-900/40 text-amber-300 border-amber-600/40',
        };
      case 'info':
        return {
          bg: 'bg-slate-900/95',
          border: 'border-blue-500/80',
          text: 'text-blue-100',
          iconColor: 'text-blue-400',
          icon: Info,
          glow: 'shadow-[0_10px_30px_rgba(59,130,246,0.3)]',
          badge: 'bg-blue-900/40 text-blue-300 border-blue-500/40',
        };
      case 'success':
      default:
        return {
          bg: 'bg-[#06201A]/95',
          border: 'border-[#D4AF37]',
          text: 'text-white',
          iconColor: 'text-[#D4AF37]',
          icon: CheckCircle2,
          glow: 'shadow-[0_12px_36px_rgba(212,175,55,0.28)]',
          badge: 'bg-[#0B2B22] text-[#D4AF37] border-[#D4AF37]/50',
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
      <div
        className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 backdrop-blur-md ${theme.bg} ${theme.border} ${theme.text} ${theme.glow}`}
      >
        <div className="p-1.5 rounded-xl bg-black/30 shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${theme.iconColor}`} />
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${theme.badge}`}
            >
              {type === 'success'
                ? 'Updated'
                : type === 'delete'
                ? 'Removed'
                : type === 'error'
                ? 'Notice'
                : 'Info'}
            </span>
            <span className="text-xs text-gray-400 font-medium">HAYBAH Admin</span>
          </div>
          <p className="text-sm font-bold leading-snug">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
