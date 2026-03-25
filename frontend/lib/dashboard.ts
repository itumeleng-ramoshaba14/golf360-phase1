import { api } from "./api";
import type { RoundSummary } from "./rounds";

export type DashboardResponse = {
  fullName: string;
  handicap?: number | null;
  totalRounds: number;
  completedRounds: number;
  bestRound?: number | null;
  averageScore?: number | null;
  winRate: number;
  golfGroups: number;
  recentRounds: RoundSummary[];
};

export async function getMyDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get("/dashboard/my");
  return data;
}
