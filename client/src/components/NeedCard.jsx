import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NeedCard = ({ need, currentUser, onFulfill, onDelete, actionLoading }) => {
  const { _id, title, category, description, requestedBy, hostel, createdAt, status } = need;

  const isOwner = currentUser && requestedBy && currentUser._id === requestedBy._id;

  const handleIHaveThis = () => {
    if (!requestedBy?.phoneNumber) return;
    const cleanPhone = requestedBy.phoneNumber.replace(/\D/g, '');
    const message = `Hi ${requestedBy.name || 'there'}! I saw your request on HostelHub: "${title}". I have this item, are you still looking for it?`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const timeAgo = dayjs(createdAt).fromNow();

  return (
    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/25 transition-all text-left space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-indigo-550/15 text-indigo-400 border border-indigo-500/10">
            {category}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">{timeAgo}</span>
        </div>
        <h3 className="font-extrabold text-slate-100 text-base leading-snug line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-850/50 space-y-4">
        {/* Requester details */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center font-bold text-slate-400">
              👤
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">
                {isOwner ? 'You' : (requestedBy?.name || 'Hub Student')}
              </span>
              <span className="text-[10px] text-slate-500">
                📍 {hostel} {requestedBy?.roomNumber && `• Room ${requestedBy.roomNumber}`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {status === 'Fulfilled' ? (
            <span className="block w-full text-center py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-700">
              Fulfilled ✔
            </span>
          ) : !isOwner ? (
            <button
              onClick={handleIHaveThis}
              disabled={!requestedBy?.phoneNumber}
              className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/10 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>💬</span> I have this!
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onFulfill(_id)}
                disabled={actionLoading === _id}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
              >
                {actionLoading === _id ? '...' : 'Fulfill'}
              </button>
              <button
                onClick={() => onDelete(_id)}
                disabled={actionLoading === _id}
                className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-455 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeedCard;
