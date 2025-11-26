
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Role, User, Notification } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { BellIcon } from './icons/BellIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface HeaderProps {
  role: Role;
  currentUser: User | null;
  onLogout: () => void;
  onSwitchToProfile: () => void;
  notifications: Notification[];
  markNotificationsAsRead: (userIdentifier: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  role, 
  currentUser, 
  onLogout, 
  onSwitchToProfile, 
  notifications, 
  markNotificationsAsRead 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
        .filter(n => n.userIdentifier === currentUser.userIdentifier)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, currentUser]);

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications && unreadCount > 0 && currentUser) {
      markNotificationsAsRead(currentUser.userIdentifier);
    }
    setShowNotifications(!showNotifications);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  return (
    <header className="bg-brand-primary text-brand-text shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <ClipboardListIcon className="w-8 h-8" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Sistem Pelaporan Fasilitas
          </h1>
        </div>
        <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={handleToggleNotifications}
                    className="p-2 rounded-full hover:bg-brand-primary-dark/30 transition-colors relative"
                >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-brand-primary flex items-center justify-center">
                           <span className="sr-only">{unreadCount} notifikasi baru</span>
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Notifikasi</h3>
                            <span className="text-xs text-gray-500">{userNotifications.length} Total</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {userNotifications.length > 0 ? (
                                userNotifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-3 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {notification.type === 'success' ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 leading-snug">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Tidak ada notifikasi baru.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

          <div className="h-6 w-px bg-brand-text/20 mx-1"></div>

          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-sm font-semibold hidden sm:inline">
              {currentUser?.name || role}
            </span>
          </div>
          <button
            onClick={onSwitchToProfile}
            className="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 bg-brand-primary-dark/30 text-brand-text hover:bg-brand-primary-dark/50"
          >
            Profil
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 bg-white text-brand-primary-dark shadow hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
