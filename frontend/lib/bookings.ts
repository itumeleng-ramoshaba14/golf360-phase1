import { api } from "./api";

export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface BookingResponse {
  id: string;
  teeTimeId: string;
  courseId: string;
  courseName: string;
  slotTime: string;
  players: number;
  guestNames: string[];
  status: BookingStatus;
  createdAt: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string | null;
}

export interface AdminBookingResponse {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  slotTime: string;
  players: number;
  guestNames: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
}

export interface AdminBookingStatsResponse {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  paidBookings: number;
  pendingPayments: number;
  paidRevenue: number;
}

export interface CourseResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  city?: string;
  province?: string;
  country?: string;
}

export interface TeeTimeResponse {
  id: string;
  courseId: string;
  courseName: string;
  slotTime: string;
  maxPlayers: number;
  bookedPlayers: number;
  available: boolean;
  availableSpots: number;
  price: number;
  status: string;
}

export async function createBooking(
  teeTimeId: string,
  players: number,
  guestNames: string[] = [],
  notes?: string
) {
  const { data } = await api.post(`/bookings/tee-times/${teeTimeId}`, {
    players,
    guestNames,
    notes,
  });
  return data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const { data } = await api.get("/bookings/me");
  return data;
}

export async function getBookingById(bookingId: string): Promise<BookingResponse> {
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
}

export async function payForBooking(bookingId: string): Promise<BookingResponse> {
  const { data } = await api.patch(`/bookings/${bookingId}/pay`);
  return data;
}

export async function cancelBooking(bookingId: string): Promise<BookingResponse> {
  const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
  return data;
}

export async function getAdminBookings(filters?: {
  status?: string;
  courseId?: string;
  search?: string;
}): Promise<AdminBookingResponse[]> {
  const params = new URLSearchParams();

  if (filters?.status) params.set("status", filters.status);
  if (filters?.courseId) params.set("courseId", filters.courseId);
  if (filters?.search) params.set("search", filters.search);

  const query = params.toString();
  const { data } = await api.get(`/admin/bookings${query ? `?${query}` : ""}`);
  return data;
}

export async function getAdminBookingStats(): Promise<AdminBookingStatsResponse> {
  const { data } = await api.get("/admin/bookings/stats");
  return data;
}

export async function cancelBookingAsAdmin(bookingId: string): Promise<AdminBookingResponse> {
  const { data } = await api.patch(`/admin/bookings/${bookingId}/cancel`);
  return data;
}

export async function getCourseById(id: string): Promise<CourseResponse> {
  const { data } = await api.get(`/courses/${id}`);
  return data;
}

export async function getTeeTimesByCourse(courseId: string): Promise<TeeTimeResponse[]> {
  const { data } = await api.get(`/tee-times/course/${courseId}`);
  return data;
}