export type PotwWeekListItem = {
  id: number;
  topic: string;
  description: string | null;
  createdAt: string;
  problemCount: number;
  attempted: boolean;
  score?: number;
  totalProblems?: number;
};

export type PotwProblem = {
  id: number;
  prompt: string;
  choices: string[];
  orderIndex: number;
  correctIndex?: number;
};

export type PotwAnswer = {
  problemId: number;
  selectedIndex: number;
  correct: boolean;
};

export type PotwAttemptResult = {
  score: number;
  totalProblems: number;
  answers: PotwAnswer[];
  submittedAt: string;
};

export type PotwWeekDetail = {
  week: {
    id: number;
    topic: string;
    description: string | null;
    createdAt: string;
  };
  attempted: boolean;
  attempt?: PotwAttemptResult;
  problems: PotwProblem[];
};

export type PotwRankingRow = {
  userId: number;
  name: string | null;
  username: string | null;
  totalScore: number;
  totalPossible: number;
  attempts: number;
};
