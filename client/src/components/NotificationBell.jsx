import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Briefcase, Calendar, ClipboardCheck, Building2, Info } from 'lucide-react';
import { fetchNotifications, markAllRead } from '../redux/slices/notificationSlice.js';

const TYPE_META = {
  application: { icon: Briefcase, color: 'text-signal bg-signal/10' },
  interview: { icon: Calendar, color: 'text-pulse-dark bg-pulse/10' },
  assessment: { icon: ClipboardCheck, color: 'text-ember bg-ember/10' },
  company: { icon: Building2, color: 'text-signal bg-signal/10' },
  job: { icon: Briefcase, color: 'text-slate-soft bg-slate-100' },
  system: { icon: Info, color: 'text-slate-soft bg-slate-100' },
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-soft hover:bg-slate-100 transition-colors"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-ember text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lifted border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-display font-semibold text-slate-ink text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllRead())}
                className="text-xs text-signal flex items-center gap-1 hover:underline"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {items.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">You're all caught up</p>
            ) : (
              items.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.system;
                const Icon = meta.icon;
                return (
                  <div key={n._id} className={`px-4 py-3 hover:bg-slate-50 ${!n.isRead ? 'bg-signal/5' : ''}`}>
                    <div className="flex gap-3 items-start">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-ink">{n.title}</p>
                        <p className="text-xs text-slate-soft mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-signal rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
