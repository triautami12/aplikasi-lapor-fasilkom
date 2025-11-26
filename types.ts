
export enum Status {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export enum Urgency {
  Rendah = 'Rendah',
  Sedang = 'Sedang',
  Tinggi = 'Tinggi',
}

export interface Comment {
  id: string;
  userName: string;
  userRole: Role;
  text: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  name: string;
  userIdentifier: string;
  location: string;
  specificLocation?: string;
  category: string;
  description: string;
  status: Status;
  submittedAt: Date;
  urgency: Urgency;
  photos: string[]; // Array of base64 encoded images
  comments: Comment[];
}

export enum Role {
  Mahasiswa = 'Mahasiswa',
  Dosen = 'Dosen',
  Pegawai = 'Pegawai',
  Admin = 'Admin',
}

export interface User {
  name: string;
  userIdentifier: string;
  password: string; // Dalam aplikasi nyata, ini harus berupa hash
  role: Role;
}

export interface Notification {
  id: string;
  userIdentifier: string; // Who receives this notification
  message: string;
  type: 'success' | 'info' | 'warning';
  isRead: boolean;
  timestamp: Date;
}
