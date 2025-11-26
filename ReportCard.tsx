
import React, { useState } from 'react';
import { Report, Role, Status, Urgency, User } from '../types';
import { BuildingIcon } from './icons/BuildingIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { UserIcon } from './icons/UserIcon';
import { AtSignIcon } from './icons/AtSignIcon';
import { MessageCircleIcon } from './icons/MessageCircleIcon';

interface ReportCardProps {
  report: Report;
  role: Role;
  updateReportStatus?: (id: string, newStatus: Status) => void;
  addComment?: (reportId: string, text: string) => void;
  currentUser?: User | null;
}

const statusStyles: { [key in Status]: { bg: string; text: string; ring: string; border: string; } } = {
  [Status.Pending]: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-600/20', border: 'border-l-4 border-status-pending' },
  [Status.InProgress]: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-600/20', border: 'border-l-4 border-status-progress' },
  [Status.Resolved]: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-600/20', border: 'border-l-4 border-status-resolved' },
};

const urgencyStyles: { [key in Urgency]: { bg: string; text: string; ring: string; } } = {
    [Urgency.Rendah]: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-600/20' },
    [Urgency.Sedang]: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-600/20' },
    [Urgency.Tinggi]: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-600/20' },
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const styles = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles.bg} ${styles.text} ring-1 ring-inset ${styles.ring}`}
    >
      {status}
    </span>
  );
};

const UrgencyBadge: React.FC<{ urgency: Urgency }> = ({ urgency }) => {
    const styles = urgencyStyles[urgency];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${styles.bg} ${styles.text} ring-1 ring-inset ${styles.ring}`}
      >
        <AlertTriangleIcon className="w-3 h-3" />
        {urgency}
      </span>
    );
};


const ReportCard: React.FC<ReportCardProps> = ({ report, role, updateReportStatus, addComment, currentUser }) => {
  const [commentText, setCommentText] = useState('');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (updateReportStatus) {
      updateReportStatus(report.id, e.target.value as Status);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addComment && commentText.trim()) {
      addComment(report.id, commentText);
      setCommentText('');
    }
  };
  
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(report.submittedAt);

  const formatCommentDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
  }

  const cardStyles = statusStyles[report.status];

  const selectStatusStyle = {
    [Status.Pending]: 'bg-yellow-100 text-yellow-800 border-status-pending hover:bg-yellow-200 focus:ring-status-pending',
    [Status.InProgress]: 'bg-blue-100 text-blue-800 border-status-progress hover:bg-blue-200 focus:ring-status-progress',
    [Status.Resolved]: 'bg-green-100 text-green-800 border-status-resolved hover:bg-green-200 focus:ring-status-resolved',
  }[report.status];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cardStyles.border}`}>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <UserIcon className="w-4 h-4 text-gray-600" />
              <span>{report.name}</span>
            </div>
            <div className="pl-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <AtSignIcon className="w-4 h-4" />
                    <span>{report.userIdentifier}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <BuildingIcon className="w-4 h-4" />
                    <span>{report.location}</span>
                </div>
                {report.specificLocation && (
                <div className="text-sm text-gray-500 mt-1 pl-6">
                    <span>{report.specificLocation}</span>
                </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <WrenchIcon className="w-4 h-4" />
                    <span>{report.category}</span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <UrgencyBadge urgency={report.urgency} />
            <StatusBadge status={report.status} />
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed my-3">{report.description}</p>
        
        {report.photos && report.photos.length > 0 && (
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <PaperclipIcon className="w-4 h-4" />
                    Lampiran Foto
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {report.photos.map((photo, index) => (
                        <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
                             <img src={photo} alt={`Lampiran ${index + 1}`} className="h-24 w-full object-cover rounded-md border border-gray-200 hover:opacity-80 transition-opacity" />
                        </a>
                    ))}
                </div>
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-400 mt-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Dilaporkan pada: {formattedDate}</span>
          </div>
          {role === Role.Admin && updateReportStatus && (
            <div className="mt-3 sm:mt-0">
              <label htmlFor={`status-${report.id}`} className="sr-only">Ubah Status</label>
              <select
                id={`status-${report.id}`}
                value={report.status}
                onChange={handleStatusChange}
                className={`text-xs font-bold p-1.5 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200 cursor-pointer ${selectStatusStyle}`}
              >
                {Object.values(Status).map((s) => (
                  <option key={s} value={s} className="font-bold bg-white text-gray-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3 text-brand-primary-dark font-semibold">
                <MessageCircleIcon className="w-5 h-5" />
                <h3>Tanggapan</h3>
            </div>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {report.comments && report.comments.length > 0 ? (
                    report.comments.map((comment) => (
                        <div 
                            key={comment.id} 
                            className={`flex flex-col ${comment.userRole === Role.Admin ? 'items-end' : 'items-start'}`}
                        >
                            <div 
                                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                    comment.userRole === Role.Admin 
                                    ? 'bg-brand-primary/20 border border-brand-primary/30 text-gray-800' 
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-xs">{comment.userName}</span>
                                    <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-black/5 rounded-full">
                                        {comment.userRole}
                                    </span>
                                </div>
                                <p>{comment.text}</p>
                                <div className={`text-[10px] text-gray-400 mt-1 ${comment.userRole === Role.Admin ? 'text-right' : 'text-left'}`}>
                                    {formatCommentDate(comment.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 text-sm italic py-2">Belum ada tanggapan.</p>
                )}
            </div>

            {addComment && currentUser && (
                <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start">
                    <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={role === Role.Admin ? "Berikan tanggapan sebagai admin..." : "Balas tanggapan..."}
                        className="flex-1 text-sm border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary min-h-[40px] px-3 py-2 resize-none"
                        rows={1}
                    />
                    <button 
                        type="submit"
                        disabled={!commentText.trim()}
                        className="bg-brand-primary text-brand-text text-sm font-semibold px-4 py-2 rounded-md hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Kirim
                    </button>
                </form>
            )}
        </div>

      </div>
    </div>
  );
};

export default ReportCard;
