export interface ProfileData {
  name: string;
  class: string;
  year: string;
  nisn: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  parentName: string;
  parentPhone: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  detail: string;
  icon: any;
  color: string;
  time: string;
  read: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
  icon: any;
  color: string;
}
