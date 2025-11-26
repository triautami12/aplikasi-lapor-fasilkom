
import React, { useState, useCallback, useEffect } from 'react';
import { Report, Role, Status, Urgency, User, Comment, Notification } from './types';
import Header from './components/Header';
import StudentView from './components/StudentView';
import AdminView from './components/AdminView';
import Login from './components/Login';
import Register from './components/Register';
import ProfilePage from './components/ProfilePage';

// Data awal hanya untuk pemuatan pertama kali jika localStorage kosong
const initialMockReports: Report[] = [
    {
      id: '1',
      name: 'Budi Hartono',
      userIdentifier: 'budi.hartono@email.com',
      location: 'Perpustakaan Pusat',
      specificLocation: 'Ruang Baca Lantai 2, dekat rak buku fiksi',
      category: 'Kerusakan AC',
      description: 'AC di lantai 2 tidak dingin sama sekali, sangat panas dan tidak nyaman untuk belajar.',
      status: Status.Pending,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      urgency: Urgency.Tinggi,
      photos: [],
      comments: [
        {
          id: 'c1',
          userName: 'Admin Fasilkom',
          userRole: Role.Admin,
          text: 'Terima kasih laporannya. Teknisi akan segera mengecek ke lokasi siang ini.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: '2',
      name: 'Citra Lestari',
      userIdentifier: 'citralestari',
      location: 'Kantin Pusat (Food Court)',
      category: 'Kebersihan',
      description: 'Banyak sampah berserakan di bawah meja dan tidak ada petugas yang membersihkan.',
      status: Status.InProgress,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      urgency: Urgency.Sedang,
      photos: [],
      comments: []
    },
    {
      id: '3',
      name: 'Dewi Anggraini',
      userIdentifier: 'd.anggraini@email.com',
      location: 'Fakultas Teknik - Gedung A',
      specificLocation: 'Ruang Kelas T-201',
      category: 'Fasilitas Belajar',
      description: 'Proyektor di ruang kelas T-201 mati dan tidak bisa digunakan untuk presentasi.',
      status: Status.Resolved,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      urgency: Urgency.Rendah,
      photos: [],
      comments: []
    },
];

const REPORTS_STORAGE_KEY = 'campusReports-shared';
const USERS_STORAGE_KEY = 'campusUsers';
const NOTIFICATIONS_STORAGE_KEY = 'campusNotifications';


const App: React.FC = () => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [mainView, setMainView] = useState<'dashboard' | 'profile'>('dashboard');

  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const savedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (savedReports) {
        return JSON.parse(savedReports).map((report: any) => ({
          ...report,
          submittedAt: new Date(report.submittedAt),
          comments: (report.comments || []).map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error("Gagal memuat laporan dari localStorage:", error);
    }
    return initialMockReports;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    }
    return [];
  });
  
  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error("Gagal menyimpan laporan ke localStorage:", error);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Gagal menyimpan notifikasi ke localStorage:", error);
    }
  }, [notifications]);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (error) {
      console.error("Gagal memuat pengguna dari localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Gagal menyimpan pengguna ke localStorage:", error);
    }
  }, [users]);

  const createNotification = useCallback((userIdentifier: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(),
      userIdentifier,
      message,
      type,
      isRead: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback((userIdentifier: string) => {
    setNotifications(prev => prev.map(n => 
      n.userIdentifier === userIdentifier ? { ...n, isRead: true } : n
    ));
  }, []);

  const addReport = useCallback((newReport: Omit<Report, 'id' | 'status' | 'submittedAt' | 'comments'>) => {
    const report: Report = {
      ...newReport,
      id: new Date().toISOString(),
      status: Status.Pending,
      submittedAt: new Date(),
      comments: [],
    };
    setReports(prevReports => [report, ...prevReports]);
    
    // Notify the user who created the report
    createNotification(
      newReport.userIdentifier, 
      `Laporan Anda "${newReport.category} di ${newReport.location}" berhasil dikirim dan statusnya "Pending".`,
      'success'
    );
  }, [createNotification]);

  const updateReportStatus = useCallback((id: string, newStatus: Status) => {
    // We need to find the report first to get the user identifier
    let targetReport: Report | undefined;
    
    setReports(prevReports => {
        const updatedReports = prevReports.map(report => {
            if (report.id === id) {
                targetReport = report;
                return { ...report, status: newStatus };
            }
            return report;
        });
        return updatedReports;
    });

    // We use a timeout to ensure this runs after state update logic processes, 
    // although with React batching and the closure variable `targetReport` assigned inside the map, 
    // we need to be careful. The clean way is to find it from current state or inside the setter.
    // However, finding it inside the setter is tricky for side effects.
    // Let's iterate `reports` (current state) before setting state to find the owner.
    
    // Note: `reports` state here might be stale inside callback if not in dependency, 
    // but we can just use the function form of setState effectively or just find it from the `prevReports` logic if we refactored.
    // For simplicity, let's find it in the reports array passed to the setter or trust React to re-render.
    // ACTUALLY: The best way is to handle the side effect.
    
    // Optimized Approach:
    // We can't easily access the report inside the setState callback for side effects.
    // So we search for it in the current state `reports` assuming `reports` is up to date enough for this action.
  }, [createNotification]); // Dependency on createNotification

  // Adjusted updateReportStatus to correctly handle the side effect with access to current data
  const handleUpdateStatus = (id: string, newStatus: Status) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      updateReportStatus(id, newStatus);
      createNotification(
        report.userIdentifier,
        `Status laporan "${report.category}" Anda telah diperbarui menjadi: ${newStatus}`,
        'info'
      );
    }
  };

  const addComment = useCallback((reportId: string, text: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      text: text,
      timestamp: new Date(),
    };

    setReports(prevReports => {
      // Side effect check inside reducer pattern (pseudo)
      const targetReport = prevReports.find(r => r.id === reportId);
      if (targetReport) {
         // Logic: If Admin comments, notify User. If User comments, maybe notify Admin (optional, skip for now).
         if (currentUser.role === Role.Admin) {
            // Need to call createNotification here, but better to do it outside.
            // We'll leave the notification logic outside the setter to avoid purity issues.
         }
      }

      return prevReports.map(report => 
        report.id === reportId 
          ? { ...report, comments: [...report.comments, newComment] }
          : report
      );
    });
    
    // Notification logic for comments
    const report = reports.find(r => r.id === reportId);
    if (report && currentUser.role === Role.Admin) {
         createNotification(
            report.userIdentifier,
            `Admin menanggapi laporan "${report.category}": "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
            'info'
         );
    }

  }, [currentUser, createNotification, reports]);
  
  const handleRegister = useCallback((newUser: User): { success: boolean, message: string } => {
    const userExists = users.some(user => user.userIdentifier.toLowerCase() === newUser.userIdentifier.toLowerCase());
    if (userExists) {
      return { success: false, message: 'Email / Username sudah terdaftar.' };
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true, message: 'Pendaftaran berhasil!' };
  }, [users]);
  
  const handleLogin = (userIdentifier: string, password: string): boolean => {
    // Admin check
    if (userIdentifier === 'admin1' && password === '123456') {
      setUserRole(Role.Admin);
      setCurrentUser({ name: 'Admin Fasilkom', userIdentifier: 'admin1', password: '', role: Role.Admin });
      setMainView('dashboard');
      return true;
    }

    // Regular user check
    const user = users.find(u => u.userIdentifier.toLowerCase() === userIdentifier.toLowerCase());
    if (user && user.password === password) {
      setUserRole(user.role);
      setCurrentUser(user);
      setMainView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setCurrentView('login');
    setMainView('dashboard');
  };
  
  const handleSwitchToProfile = () => setMainView('profile');
  const handleSwitchToDashboard = () => setMainView('dashboard');

  if (!userRole) {
    switch (currentView) {
      case 'register':
        return <Register onSwitchToLogin={() => setCurrentView('login')} onRegister={handleRegister} />;
      case 'login':
      default:
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} />;
    }
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Header 
        role={userRole} 
        currentUser={currentUser}
        onLogout={handleLogout} 
        onSwitchToProfile={handleSwitchToProfile}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
      />
      <main className="container mx-auto p-4 md:p-8">
        {mainView === 'profile' && currentUser ? (
          <ProfilePage 
            currentUser={currentUser} 
            allReports={reports}
            onBackToDashboard={handleSwitchToDashboard}
            userRole={userRole}
            addComment={addComment}
          />
        ) : (
          <>
            {userRole === Role.Admin && currentUser ? (
              <AdminView 
                reports={reports} 
                updateReportStatus={handleUpdateStatus} 
                addComment={addComment}
                currentUser={currentUser}
              />
            ) : (
              <StudentView 
                reports={reports} 
                addReport={addReport} 
                currentUser={currentUser} 
                userRole={userRole} 
                addComment={addComment}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
