"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookingResponse,
  cancelBooking,
  getBookingById,
  payForBooking,
} from "@/lib/bookings";
import { useToast } from "@/components/ToastProvider";

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const { showToast } = useToast();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error: any) {
      console.error("Failed to load booking", error);
      showToast(error?.response?.data?.message || "Failed to load booking details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const handleCancel = async () => {
    if (!booking) return;

    try {
      setCancelling(true);
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
      showToast("Booking cancelled successfully", "success");
    } catch (error: any) {
      console.error("Failed to cancel booking", error);
      showToast(error?.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;

    try {
      setPaying(true);
      const updated = await payForBooking(booking.id);
      setBooking(updated);
      showToast("Payment completed successfully", "success");
    } catch (error: any) {
      console.error("Failed to pay for booking", error);
      showToast(error?.response?.data?.message || "Payment failed", "error");
    } finally {
      setPaying(false);
    }
  };

  const createRoundHref = useMemo(() => {
    if (!booking) return "#";

    const params = new URLSearchParams({
      bookingId: booking.id,
      courseId: booking.courseId,
      scheduledAt: booking.slotTime,
      courseName: booking.courseName,
      guestNames: booking.guestNames.join(", "),
    });

    return `/rounds?${params.toString()}`;
  }, [booking]);

  if (loading) {
    return (
      <main style={{ padding: "24px", color: "white" }}>
        <p>Loading booking details...</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main style={{ padding: "24px", color: "white" }}>
        <p>Booking not found.</p>
      </main>
    );
  }

  const canCreateRound =
    booking.status === "CONFIRMED" && booking.paymentStatus === "PAID";

  return (
    <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "white" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/bookings"
          style={{
            color: "#93f5b0",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Back to My Bookings
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #2a3a5a",
          borderRadius: "16px",
          padding: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px" }}>
          Booking Details
        </h1>

        <div style={{ display: "grid", gap: "10px", marginBottom: "18px" }}>
          <p><strong>Booking ID:</strong> {booking.id}</p>
          <p><strong>Course:</strong> {booking.courseName}</p>
          <p><strong>Tee Time:</strong> {new Date(booking.slotTime).toLocaleString()}</p>
          <p><strong>Players:</strong> {booking.players}</p>
          <p><strong>Total Amount:</strong> {booking.totalAmount}</p>
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
          <p>
            <strong>Booking Status:</strong>{" "}
            <span
              style={{
                fontWeight: 700,
                color: booking.status === "CONFIRMED" ? "#86efac" : "#fca5a5",
              }}
            >
              {booking.status}
            </span>
          </p>
          <p><strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
        </div>

        {booking.guestNames.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Guest Players</h2>
            <ul style={{ paddingLeft: "20px" }}>
              {booking.guestNames.map((guest, index) => (
                <li key={`${booking.id}-guest-detail-${index}`}>{guest}</li>
              ))}
            </ul>
          </div>
        )}

        {booking.notes && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Notes</h2>
            <p>{booking.notes}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {booking.status === "CONFIRMED" && booking.paymentStatus === "PENDING" && (
            <button
              onClick={handlePayNow}
              disabled={paying}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: "#16a34a",
                color: "#fff",
                fontWeight: 700,
                cursor: paying ? "not-allowed" : "pointer",
              }}
            >
              {paying ? "Processing Payment..." : "Pay Now"}
            </button>
          )}

          {canCreateRound && (
            <Link
              href={createRoundHref}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create Round
            </Link>
          )}

          {booking.status === "CONFIRMED" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 700,
                cursor: cancelling ? "not-allowed" : "pointer",
              }}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>

        {!canCreateRound && (
          <p style={{ marginTop: "16px", color: "#cbd5e1" }}>
            A round can be created once the booking is confirmed and payment is marked as paid.
          </p>
        )}
      </div>
    </main>
  );
}