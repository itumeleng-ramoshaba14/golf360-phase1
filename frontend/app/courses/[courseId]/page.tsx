"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  createBooking,
  getCourseById,
  getTeeTimesByCourse,
  CourseResponse,
  TeeTimeResponse,
} from "@/lib/bookings";
import { useToast } from "@/components/ToastProvider";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const { showToast } = useToast();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [teeTimes, setTeeTimes] = useState<TeeTimeResponse[]>([]);
  const [players, setPlayers] = useState<number>(1);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const guestCount = useMemo(() => Math.max(0, players - 1), [players]);

  useEffect(() => {
    setGuestNames((current) => {
      const next = [...current];
      while (next.length < guestCount) next.push("");
      return next.slice(0, guestCount);
    });
  }, [guestCount]);

  const loadData = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      const teeTimeData = await getTeeTimesByCourse(courseId);
      setTeeTimes(teeTimeData);
    } catch (error: any) {
      console.error("Failed to load course details", error);
      showToast(
        error?.response?.data?.message || "Failed to load course details",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const updateGuestName = (index: number, value: string) => {
    setGuestNames((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleBook = async (teeTimeId: string) => {
    try {
      const trimmedGuests = guestNames.map((name) => name.trim());

      if (players > 1 && trimmedGuests.some((name) => !name)) {
        showToast("Please fill in all guest names.", "error");
        return;
      }

      setBookingId(teeTimeId);
      await createBooking(teeTimeId, players, trimmedGuests);
      showToast("Booking confirmed successfully", "success");
      await loadData();
    } catch (error: any) {
      console.error("Booking failed", error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Booking failed",
        "error"
      );
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "24px", color: "white" }}>
        <p>Loading course details...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main style={{ padding: "24px", color: "white" }}>
        <p>Course not found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "white" }}>
      <div
        style={{
          border: "1px solid #2a3a5a",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "10px" }}>
          {course.name}
        </h1>

        {course.description && (
          <p style={{ color: "#d0d7e2", marginBottom: "10px" }}>{course.description}</p>
        )}

        {course.city && (
          <p style={{ color: "#d0d7e2" }}>
            <strong>City:</strong> {course.city}
          </p>
        )}

        {course.province && (
          <p style={{ color: "#d0d7e2" }}>
            <strong>Province:</strong> {course.province}
          </p>
        )}

        {course.country && (
          <p style={{ color: "#d0d7e2" }}>
            <strong>Country:</strong> {course.country}
          </p>
        )}
      </div>

      <div
        style={{
          border: "1px solid #2a3a5a",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <label
          htmlFor="players"
          style={{ display: "block", fontWeight: 600, marginBottom: "10px" }}
        >
          Number of Players
        </label>

        <select
          id="players"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            minWidth: "220px",
            marginBottom: guestCount > 0 ? "18px" : "0",
          }}
        >
          <option value={1}>1 Player</option>
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>

        {guestCount > 0 && (
          <div style={{ display: "grid", gap: "14px" }}>
            <h3 style={{ fontSize: "18px", margin: 0 }}>Guest Names</h3>
            {guestNames.map((guestName, index) => (
              <div key={index}>
                <label
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  Guest {index + 1}
                </label>
                <input
                  value={guestName}
                  onChange={(e) => updateGuestName(index, e.target.value)}
                  placeholder={`Enter guest ${index + 1} name`}
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <section>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
          Available Tee Times
        </h2>

        {teeTimes.length === 0 ? (
          <p>No tee times found for this course.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {teeTimes.map((teeTime) => (
              <div
                key={teeTime.id}
                style={{
                  border: "1px solid #2a3a5a",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "grid", gap: "8px", marginBottom: "14px" }}>
                  <p>
                    <strong>Time:</strong> {new Date(teeTime.slotTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Price:</strong> {teeTime.price}
                  </p>
                  <p>
                    <strong>Available Spots:</strong> {teeTime.availableSpots}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          teeTime.status === "AVAILABLE"
                            ? "#86efac"
                            : teeTime.status === "LIMITED"
                            ? "#fcd34d"
                            : "#fca5a5",
                      }}
                    >
                      {teeTime.status}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleBook(teeTime.id)}
                  disabled={
                    !teeTime.available ||
                    teeTime.availableSpots < players ||
                    bookingId === teeTime.id
                  }
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border: "none",
                    cursor:
                      !teeTime.available ||
                      teeTime.availableSpots < players ||
                      bookingId === teeTime.id
                        ? "not-allowed"
                        : "pointer",
                    background:
                      !teeTime.available || teeTime.availableSpots < players
                        ? "#777"
                        : "#111",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  {bookingId === teeTime.id
                    ? "Booking..."
                    : teeTime.availableSpots < players
                    ? "Not Enough Spots"
                    : "Book Tee Time"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}