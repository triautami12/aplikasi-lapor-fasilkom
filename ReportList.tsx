
import React from 'react';
import { Report, Role, Status, User } from '../types';
import ReportCard from './ReportCard';

interface ReportListProps {
  reports: Report[];
  role: Role;
  updateReportStatus?: (id: string, newStatus: Status) => void;
  addComment?: (reportId: string, text: string) => void;
  currentUser?: User | null;
}

const ReportList: React.FC<ReportListProps> = ({ reports, role, updateReportStatus, addComment, currentUser }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-600">Belum ada laporan.</h3>
        <p className="text-gray-500">Silakan buat laporan baru jika Anda menemukan masalah.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          role={role}
          updateReportStatus={updateReportStatus}
          addComment={addComment}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default ReportList;
