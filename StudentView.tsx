
import React, { useState, useMemo } from 'react';
import { Report, User } from '../types';
import ReportForm from './ReportForm';
import ReportList from './ReportList';
import { Role } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface StudentViewProps {
  reports: Report[];
  addReport: (newReport: Omit<Report, 'id' | 'status' | 'submittedAt' | 'comments'>) => void;
  currentUser: User | null;
  userRole: Role;
  addComment: (reportId: string, text: string) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ reports, addReport, currentUser, userRole, addComment }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const userReports = useMemo(() => {
    if (!currentUser) return [];
    
    let filtered = reports.filter(report => report.userIdentifier === currentUser.userIdentifier);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.location.toLowerCase().includes(query) ||
        (report.specificLocation && report.specificLocation.toLowerCase().includes(query)) ||
        report.description.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [reports, currentUser, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h2 className="text-2xl font-bold mb-4 text-brand-primary-dark">Buat Laporan Baru</h2>
        <ReportForm addReport={addReport} currentUser={currentUser} />
      </div>
      <div className="lg:col-span-2">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-brand-primary-dark">Daftar Laporan Saya</h2>
            <div className="relative w-full sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Cari laporan saya..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent shadow-sm"
                />
            </div>
         </div>
        <ReportList 
          reports={userReports} 
          role={userRole} 
          currentUser={currentUser}
          addComment={addComment}
        />
      </div>
    </div>
  );
};

export default StudentView;
