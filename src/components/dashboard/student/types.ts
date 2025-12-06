/**
 * Interface representing student profile data.
 */
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

/**
 * Interface representing a notification in the student dashboard.
 */
export interface Notification {
  id: number;
  type: string;
  message: string;
  detail: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  time: string;
  read: boolean;
}

/**
 * Interface representing a student achievement.
 */
export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
}
