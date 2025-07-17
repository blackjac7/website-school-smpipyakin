export interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

export interface Stat {
  label: string;
  value: string;
  color: string;
  icon: any;
}

export interface Applicant {
  id: number;
  name: string;
  nisn: string;
  status: string;
  statusColor: string;
  date: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  parentName: string;
  parentPhone: string;
  previousSchool: string;
  grade: number;
  documents: {
    ijazah: boolean;
    akta: boolean;
    kk: boolean;
    foto: boolean;
    raport: boolean;
  };
}

export interface ReportData {
  monthly: Array<{
    month: string;
    pendaftar: number;
    diterima: number;
    ditolak: number;
  }>;
  byRegion: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  byGrade: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}
