export type UserType = {
  id: number;
  ionId: string;
  name: string | null;
  email: string | null;
  username: string | null;
  classYear: string | null;
  roles: string[];
};

export type AttendanceBlockType = {
  id: number;
  blockType: string;
  date: string;
  code: string;
  isClosed: boolean;
  createdAt: string;
  _count?: { records: number };
};

export type POTWProblemAdmin = {
  id?: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
  orderIndex?: number;
};

export type POTWWeekAdmin = {
  id: number;
  topic: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  problemCount: number;
  attemptCount: number;
};

export type POTWAttemptAdmin = {
  id: number;
  userId: number;
  name: string | null;
  username: string | null;
  score: number;
  totalProblems: number;
  violationCount: number;
  awayMs: number;
  submittedAt: string;
};
