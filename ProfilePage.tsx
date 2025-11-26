
import React, { useState, useMemo } from 'react';
import { User, Report, Role } from '../types';
import ReportList from './ReportList';
import { AtSignIcon } from './icons/AtSignIcon';
import { UserProfileIllustration } from './illustrations/UserProfileIllustration';
import { SearchIcon } from './icons/SearchIcon';

interface ProfilePageProps {
  currentUser: User;
  allReports: Report[];
  onBackToDashboard: () => void;
  userRole: Role;
  addComment: (reportId: string, text: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, allReports, onBackToDashboard, userRole, addComment }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const userReports = useMemo(() => {
    if (userRole === Role.Admin) return [];
    
    let filtered = allReports.filter(report => report.userIdentifier === currentUser.userIdentifier);

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
  }, [allReports, currentUser, userRole, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-brand-primary-dark/20 rounded-full p-2 flex-shrink-0">
                <UserProfileIllustration className="text-brand-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{currentUser.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <AtSignIcon className="w-5 h-5"/>
                    <span>{currentUser.userIdentifier}</span>
                </div>
                 <span className="mt-2 inline-block text-sm font-semibold bg-brand-primary-dark/30 text-brand-text px-3 py-1 rounded-full">{userRole}</span>
            </div>
        </div>
      </div>
      
      {userRole !== Role.Admin && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-brand-primary-dark">Laporan Saya</h2>
              <div className="relative w-full sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Cari laporan..."
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
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onBackToDashboard}
          className="bg-brand-primary text-brand-text font-bold py-2 px-6 rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 shadow-lg"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
