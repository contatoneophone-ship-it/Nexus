export interface DriverRecord {
  id: string;
  nome: string;
  adiantamentos: number;
  diariasMes: number;
  filial: string;
  empresa: string;
  cpf: string;
  deslocamento: number;
  he50: number;
  he100: number;
  adicionalNoturno: number;
  faltas: number;
  referenceDate: string; // Format: YYYY-MM
  baseSalary: number; // Added for financial calculation
}

export interface KPIStats {
  totalHe50: number;
  totalHe100: number;
  totalNight: number;
  totalOvertime: number;
  avgOvertime: number;
  totalDisplacement: number;
  totalAbsences: number;
  costEstimate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isImage?: boolean;
}

export interface User {
  username: string;
  password?: string; // Optional for display
  role: 'admin' | 'user';
}