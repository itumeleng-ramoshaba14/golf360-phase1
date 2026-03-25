import { api } from "./api";

export type GameFormat =
  | "STROKE_PLAY"
  | "STABLEFORD"
  | "BETTER_BALL"
  | "MATCH_PLAY"
  | "SOCIAL_4BALL";

export type RoundStatus = "DRAFT" | "ACTIVE" | "COMPLETED";

export type RoundSummary = {
  id: string;
  name: string;
  courseName?: string | null;
  courseId?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  scheduledAt?: string | null;
  format: GameFormat;
  status: RoundStatus;
  participantCount: number;
  createdByName: string;
  leaderScore?: number | null;
};

export type HoleScore = {
  holeNumber: number;
  strokes: number;
};

export type RoundParticipant = {
  participantId: string;
  userId?: string | null;
  displayName: string;
  handicap?: number | null;
  holesPlayed: number;
  totalStrokes?: number | null;
  position: number;
  holeScores: HoleScore[];
};

export type RoundDetail = {
  id: string;
  name: string;
  courseName?: string | null;
  courseId?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  scheduledAt?: string | null;
  format: GameFormat;
  status: RoundStatus;
  createdByName: string;
  participants: RoundParticipant[];
  leader?: RoundParticipant | null;
};

export type CreateRoundRequest = {
  name: string;
  courseId?: string;
  groupId?: string;
  scheduledAt?: string;
  format: GameFormat;
  participantUserIds: string[];
  guestNames: string[];
};

export async function getMyRounds(): Promise<RoundSummary[]> {
  const { data } = await api.get("/rounds/my");
  return data;
}

export async function getRound(roundId: string): Promise<RoundDetail> {
  const { data } = await api.get(`/rounds/${roundId}`);
  return data;
}

export async function createRound(payload: CreateRoundRequest): Promise<RoundDetail> {
  const { data } = await api.post("/rounds", payload);
  return data;
}

export async function submitRoundScores(
  roundId: string,
  entries: Array<{ participantId: string; holeNumber: number; strokes: number }>
): Promise<RoundDetail> {
  const { data } = await api.post(`/rounds/${roundId}/scores`, { scores: entries });
  return data;
}

export async function completeRound(roundId: string): Promise<RoundDetail> {
  const { data } = await api.patch(`/rounds/${roundId}/complete`);
  return data;
}
