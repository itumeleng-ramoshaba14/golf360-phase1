import { api } from "./api";

export type GroupMember = {
  userId: string;
  fullName: string;
  email: string;
  role: "OWNER" | "MEMBER";
  handicap?: number | null;
};

export type GolfGroup = {
  id: string;
  name: string;
  description?: string | null;
  scheduleLabel?: string | null;
  homeCourseName?: string | null;
  createdByUserId: string;
  createdByName: string;
  memberCount: number;
  members: GroupMember[];
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
  scheduleLabel?: string;
  homeCourseName?: string;
};

export async function getMyGroups(): Promise<GolfGroup[]> {
  const { data } = await api.get("/groups/my");
  return data;
}

export async function createGroup(payload: CreateGroupRequest): Promise<GolfGroup> {
  const { data } = await api.post("/groups", payload);
  return data;
}

export async function addGroupMember(groupId: string, email: string): Promise<GolfGroup> {
  const { data } = await api.post(`/groups/${groupId}/members`, { email });
  return data;
}
