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
