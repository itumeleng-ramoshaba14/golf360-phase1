"use client";

import { useEffect, useState } from "react";
import {
  AdminBookingResponse,
  AdminBookingStatsResponse,
  cancelBookingAsAdmin,
  getAdminBookingStats,
  getAdminBookings,
} from "@/lib/bookings";
import { useToast } from "@/components/ToastProvider";

export default function AdminBookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [stats, setStats] = useState<AdminBookingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [courseIdFilter, setCourseIdFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const [bookingsData, statsData] = await Promise.all([
        getAdminBookings({
          status: statusFilter || undefined,
          courseId: courseIdFilter || undefined,
          search: searchFilter || undefined,
        }),
        getAdminBookingStats(),
      ]);

      setBookings(bookingsData);
      setStats(statsData);
    } catch (error: any) {
      console.error("Failed to load admin bookings", error);
      showToast(error?.response?.data?.message || "Failed to load admin bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const applyFilters = async () => {
    await loadBookings();
    showToast("Filters applied", "info");
  };

  const handleAdminCancel = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      await cancelBookingAsAdmin(bookingId);
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
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Admin Bookings Dashboard
      </h1>
      <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
        Monitor, filter, and manage all platform bookings.
      </p>

      {stats && (
        <div
          style={{
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            marginBottom: "24px",
          }}
        >
          <StatCard label="Total Bookings" value={stats.totalBookings} />
          <StatCard label="Confirmed" value={stats.confirmedBookings} />
          <StatCard label="Cancelled" value={stats.cancelledBookings} />
          <StatCard label="Paid Bookings" value={stats.paidBookings} />
          <StatCard label="Pending Payments" value={stats.pendingPayments} />
          <StatCard label="Paid Revenue" value={stats.paidRevenue} />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "24px",
          border: "1px solid #2a3a5a",
          borderRadius: "14px",
          padding: "18px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
            Search
          </label>
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by player, email, or course"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="">All</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
            Course ID Filter
          </label>
          <input
            value={courseIdFilter}
            onChange={(e) => setCourseIdFilter(e.target.value)}
            placeholder="Paste course UUID"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button
            onClick={applyFilters}
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#111",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading admin bookings...</p>
      ) : bookings.length === 0 ? (
        <div
          style={{
            border: "1px solid #2a3a5a",
            borderRadius: "12px",
            padding: "20px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <p>No bookings found.</p>
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
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>
                {booking.courseName}
              </h2>

              <div style={{ display: "grid", gap: "8px", marginBottom: "14px" }}>
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Player:</strong> {booking.userFullName}</p>
                <p><strong>Email:</strong> {booking.userEmail}</p>
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
                <p><strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color: booking.status === "CONFIRMED" ? "#86efac" : "#fca5a5",
                      fontWeight: 700,
                    }}
                  >
                    {booking.status}
                  </span>
                </p>

                {booking.guestNames.length > 0 && (
                  <div>
                    <strong>Guests:</strong>
                    <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                      {booking.guestNames.map((guest, index) => (
                        <li key={`${booking.id}-admin-guest-${index}`}>{guest}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {booking.status === "CONFIRMED" && (
                <button
                  onClick={() => handleAdminCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: cancellingId === booking.id ? "not-allowed" : "pointer",
                  }}
                >
                  {cancellingId === booking.id ? "Cancelling..." : "Admin Cancel Booking"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        border: "1px solid #2a3a5a",
        borderRadius: "14px",
        padding: "18px",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px" }}>{label}</p>
      <h3 style={{ margin: "10px 0 0 0", fontSize: "28px" }}>{value}</h3>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};