export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  class?: string;
  status: string;
  lastLogin: string;
  // Specifics
  nisn?: string;
  osisAccess?: boolean;
  nip?: string;
  gender?: "MALE" | "FEMALE";
}
