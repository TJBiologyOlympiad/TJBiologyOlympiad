export type UserType = {
  id: number;
  ionId: string;
  name: string | null;
  email: string | null;
  username: string | null;
  classYear: string | null;
  roles: string[];
  leaderboardBanned: boolean;
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
  imageUrl?: string | null;
  orderIndex?: number;
};

export type POTWWeekAdmin = {
  id: number;
  topic: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  createdById: number | null;
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
  durationMs: number;
  copyCount: number;
  pasteCount: number;
  leaderboardBanned: boolean;
  submittedAt: string;
};
