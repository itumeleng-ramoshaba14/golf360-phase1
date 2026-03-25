"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cancelBooking, getMyBookings, BookingResponse } from "@/lib/bookings";
import { useToast } from "@/components/ToastProvider";

export default function BookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch (error: any) {
      console.error("Failed to load bookings", error);
      showToast(
        error?.response?.data?.message ||
          "Failed to load bookings. Make sure you are logged in.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      await loadBookings();
      showToast("Booking cancelled successfully", "success");
    } catch (error: any) {
      console.error("Failed to cancel booking", error);
      showToast(error?.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        My Bookings
      </h1>
      <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
        View and manage your tee time reservations.
      </p>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div
          style={{
            border: "1px solid #2a3a5a",
            borderRadius: "12px",
            padding: "20px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <p>You do not have any bookings yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                border: "1px solid #2a3a5a",
                borderRadius: "14px",
                padding: "18px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                {booking.courseName}
              </h2>

              <div style={{ display: "grid", gap: "8px", marginBottom: "14px" }}>
                <p>
                  <strong>Booking ID:</strong> {booking.id}
                </p>
                <p>
                  <strong>Tee Time:</strong>{" "}
                  {new Date(booking.slotTime).toLocaleString()}
                </p>
                <p>
                  <strong>Players:</strong> {booking.players}
                </p>
                <p>
                  <strong>Total Amount:</strong> {booking.totalAmount}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        booking.paymentStatus === "PAID"
                          ? "#86efac"
                          : booking.paymentStatus === "PENDING"
                          ? "#fcd34d"
                          : booking.paymentStatus === "FAILED"
                          ? "#fca5a5"
                          : "#93c5fd",
                    }}
                  >
                    {booking.paymentStatus}
                  </span>
                </p>

                {booking.guestNames.length > 0 && (
                  <div>
                    <strong>Guests:</strong>
                    <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                      {booking.guestNames.map((guest, index) => (
                        <li key={`${booking.id}-guest-${index}`}>{guest}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {booking.notes && (
                  <p>
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        booking.status === "CONFIRMED"
                          ? "#86efac"
                          : "#fca5a5",
                      fontWeight: 700,
                    }}
                  >
                    {booking.status}
                  </span>
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href={`/bookings/${booking.id}`}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    background: "#1e293b",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  View Details
                </Link>

                {booking.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: cancellingId === booking.id ? "not-allowed" : "pointer",
                      background: "#111",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}