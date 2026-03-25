import { api } from "./api";

export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  handicap?: number | null;
  homeClub?: string | null;
  profileImageUrl?: string | null;
}

export interface UpdateUserProfileRequest {
  fullName: string;
  phoneNumber?: string;
  handicap?: number | null;
  homeClub?: string;
  profileImageUrl?: string;
}

export async function getMyProfile(): Promise<UserProfileResponse> {
  const { data } = await api.get("/profile/me");
  return data;
}

export async function updateMyProfile(
  payload: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
  const { data } = await api.patch("/profile/me", payload);
  return data;
}