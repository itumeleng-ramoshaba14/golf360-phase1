"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { getSession } from "../../lib/sessions";

type Course = {
  id: string;
  name: string;
  city?: string;
  province?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
};

type TeeTime = {
  id: string;
  courseId: string;
  courseName: string;
  slotTime: string;
  maxPlayers: number;
  bookedPlayers: number;
  price: number;
  status: string;
};

type Booking = {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  courseId?: string;
  courseName: string;
  slotTime: string;
  players: number;
  guestNames?: string[];
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  createdAt?: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teeTimesByCourse, setTeeTimesByCourse] = useState<Record<string, TeeTime[]>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [courseSearch, setCourseSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");

  const [courseForm, setCourseForm] = useState({
  name: "",
  city: "",
  province: "",
  country: "",
  description: "",
  imageUrl: "",
  holes: "18",
});

  const [teeTimeForm, setTeeTimeForm] = useState({
    courseId: "",
    slotTime: "",
    maxPlayers: 4,
    price: "",
  });

  async function loadCourses() {
    const res = await api.get("/courses");
    setCourses(res.data);
    return res.data as Course[];
  }

  async function loadBookings() {
    try {
      const res = await api.get("/bookings/admin");
      console.log("Admin bookings response:", res.data);

      const sorted = [...res.data].sort(
        (a: Booking, b: Booking) =>
          new Date(b.slotTime).getTime() - new Date(a.slotTime).getTime()
      );

      setBookings(sorted);
    } catch (err: any) {
      console.error("Failed to load admin bookings:", err?.response || err);
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to load bookings";

      setError(errorMessage);
      setBookings([]);
    }
  }

  async function loadTeeTimesForCourse(courseId: string) {
    const res = await api.get(`/tee-times/course/${courseId}`);
    setTeeTimesByCourse((prev) => ({
      ...prev,
      [courseId]: res.data,
    }));
  }

  async function loadAllData() {
    const loadedCourses = await loadCourses();
    for (const course of loadedCourses) {
      await loadTeeTimesForCourse(course.id);
    }
    await loadBookings();
  }

  useEffect(() => {
    const session = getSession();
    if (session?.role === "ADMIN") {
      setIsAdmin(true);
      loadAllData().catch(console.error);
    }
  }, []);

  async function handleCreateCourse(e: React.FormEvent) {
  e.preventDefault();
  setMessage("");
  setError("");

  try {
    console.log("Creating course with:", {
      ...courseForm,
      holes: Number(courseForm.holes),
    });

    const res = await api.post("/courses", {
      ...courseForm,
      holes: Number(courseForm.holes),
    });

    console.log("Create course response:", res.data);

    setMessage("Course created successfully.");
    alert("Course created successfully.");

    setCourseForm({
      name: "",
      city: "",
      province: "",
      country: "",
      description: "",
      imageUrl: "",
      holes: "18",
    });

    await loadAllData();
  } catch (err: any) {
    console.error("Create course failed:", err?.response || err);

    const errorMessage =
      typeof err?.response?.data === "string"
        ? err.response.data
        : err?.response?.data?.message ||
          `Failed to create course. Status: ${err?.response?.status || "unknown"}`;

    setError(errorMessage);
    alert(errorMessage);
  }
}

  async function handleCreateTeeTime(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post(`/courses/${teeTimeForm.courseId}/tee-times`, {
        slotTime: teeTimeForm.slotTime,
        maxPlayers: Number(teeTimeForm.maxPlayers),
        price: Number(teeTimeForm.price),
      });

      setMessage("Tee time created successfully.");
      setTeeTimeForm({
        courseId: "",
        slotTime: "",
        maxPlayers: 4,
        price: "",
      });
      await loadAllData();
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to create tee time";

      setError(errorMessage);
      alert(errorMessage);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setMessage("Course deleted successfully.");
      alert("Course deleted successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error("Delete course failed:", err?.response || err);
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to delete course";

      setError(errorMessage);
      alert(errorMessage);
    }
  }

  async function handleDeleteTeeTime(teeTimeId: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm("Are you sure you want to delete this tee time?");
    if (!confirmed) return;

    try {
      await api.delete(`/tee-times/${teeTimeId}`);
      setMessage("Tee time deleted successfully.");
      alert("Tee time deleted successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error("Delete tee time failed:", err?.response || err);
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to delete tee time";

      setError(errorMessage);
      alert(errorMessage);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled successfully.");
      alert("Booking cancelled successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error("Cancel booking failed:", err?.response || err);
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to cancel booking";

      setError(errorMessage);
      alert(errorMessage);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin/bookings/${bookingId}`);
      setMessage("Booking deleted successfully.");
      alert("Booking deleted successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error("Delete booking failed:", err?.response || err);
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Failed to delete booking";

      setError(errorMessage);
      alert(errorMessage);
    }
  }

  const filteredCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase();
    if (!term) return courses;

    return courses.filter((course) => {
      const haystack = [
        course.name,
        course.city,
        course.province,
        course.country,
        course.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [courses, courseSearch]);

  const filteredBookings = useMemo(() => {
    const term = bookingSearch.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = booking.status?.toUpperCase();
      const paymentStatus = booking.paymentStatus?.toUpperCase();

      const matchesStatus =
        bookingStatusFilter === "ALL" ||
        status === bookingStatusFilter.toUpperCase() ||
        paymentStatus === bookingStatusFilter.toUpperCase() ||
        (bookingStatusFilter === "CONFIRMED" && paymentStatus === "PAID");

      const haystack = [
        booking.userFullName,
        booking.userEmail,
        booking.courseName,
        booking.status,
        booking.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || haystack.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const allTeeTimes = useMemo(
    () => Object.values(teeTimesByCourse).flat(),
    [teeTimesByCourse]
  );

  const dashboardStats = useMemo(() => {
    const totalCourses = courses.length;
    const totalTeeTimes = allTeeTimes.length;
    const fullTeeTimes = allTeeTimes.filter(
      (teeTime) =>
        teeTime.status?.toUpperCase() === "FULL" ||
        teeTime.bookedPlayers >= teeTime.maxPlayers
    ).length;
    const availableTeeTimes = totalTeeTimes - fullTeeTimes;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((booking) => {
      const status = booking.status?.toUpperCase();
      const paymentStatus = booking.paymentStatus?.toUpperCase();
      return status === "CONFIRMED" || paymentStatus === "PAID";
    }).length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.status?.toUpperCase() === "CANCELLED"
    ).length;
    const totalPlayers = bookings.reduce(
      (sum, booking) => sum + (booking.players || 0),
      0
    );
    const totalRevenue = bookings
      .filter((booking) => {
        const status = booking.status?.toUpperCase();
        const paymentStatus = booking.paymentStatus?.toUpperCase();
        return status === "CONFIRMED" || paymentStatus === "PAID";
      })
      .reduce((sum, booking) => sum + (Number(booking.totalAmount) || 0), 0);

    return {
      totalCourses,
      totalTeeTimes,
      availableTeeTimes,
      fullTeeTimes,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalPlayers,
      totalRevenue,
    };
  }, [courses, allTeeTimes, bookings]);

  if (!isAdmin) {
    return (
      <main className="page-container">
        <h1>Admin</h1>
        <div className="error-banner">Access denied. Admins only.</div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>
      <p>Monitor platform performance and manage courses, tee times, and bookings from one place.</p>

      {message && <div className="success-text">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 24,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Total Courses", value: dashboardStats.totalCourses },
          { label: "Total Tee Times", value: dashboardStats.totalTeeTimes },
          { label: "Available Tee Times", value: dashboardStats.availableTeeTimes },
          { label: "Full Tee Times", value: dashboardStats.fullTeeTimes },
          { label: "Total Bookings", value: dashboardStats.totalBookings },
          { label: "Confirmed/Paid", value: dashboardStats.confirmedBookings },
          { label: "Cancelled Bookings", value: dashboardStats.cancelledBookings },
          { label: "Total Players", value: dashboardStats.totalPlayers },
          { label: "Confirmed Revenue", value: `R${dashboardStats.totalRevenue}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: 20,
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 10 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div className="card" style={{ padding: 20 }}>
          <h2>Create Course</h2>
          <form onSubmit={handleCreateCourse} className="stack">
            <input
              placeholder="Course name"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            />
            <input
              placeholder="City"
              value={courseForm.city}
              onChange={(e) => setCourseForm({ ...courseForm, city: e.target.value })}
            />
            <input
              placeholder="Province"
              value={courseForm.province}
              onChange={(e) => setCourseForm({ ...courseForm, province: e.target.value })}
            />
            <input
              placeholder="Country"
              value={courseForm.country}
              onChange={(e) => setCourseForm({ ...courseForm, country: e.target.value })}
            />
            <input
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
            <input
              placeholder="Image URL"
              value={courseForm.imageUrl}
              onChange={(e) => setCourseForm({ ...courseForm, imageUrl: e.target.value })}
            />
            <input
          type="number"
          placeholder="Number of holes"
          value={courseForm.holes}
          onChange={(e) => setCourseForm({ ...courseForm, holes: e.target.value })}
/>


            <button className="btn btn-primary" type="submit">
              Create Course
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2>Create Tee Time</h2>
          <form onSubmit={handleCreateTeeTime} className="stack">
            <select
              value={teeTimeForm.courseId}
              onChange={(e) => setTeeTimeForm({ ...teeTimeForm, courseId: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={teeTimeForm.slotTime}
              onChange={(e) => setTeeTimeForm({ ...teeTimeForm, slotTime: e.target.value })}
            />

            <input
              type="number"
              placeholder="Max players"
              value={teeTimeForm.maxPlayers}
              onChange={(e) =>
                setTeeTimeForm({
                  ...teeTimeForm,
                  maxPlayers: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={teeTimeForm.price}
              onChange={(e) => setTeeTimeForm({ ...teeTimeForm, price: e.target.value })}
            />

            <button className="btn btn-primary" type="submit">
              Create Tee Time
            </button>
          </form>
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>Existing Courses & Tee Times</h2>

      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search courses by name, location, or description..."
          value={courseSearch}
          onChange={(e) => setCourseSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gap: 20, marginBottom: 36 }}>
        {filteredCourses.map((course) => (
          <div key={course.id} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ marginBottom: 8 }}>{course.name}</h3>
                <p style={{ margin: 0 }}>
                  {[course.city, course.province, course.country].filter(Boolean).join(", ")}
                </p>
              </div>

              <button
                className="btn"
                style={{ background: "#ef4444", color: "#fff" }}
                onClick={() => handleDeleteCourse(course.id)}
              >
                Delete Course
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>Tee Times</h4>

              {teeTimesByCourse[course.id]?.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {teeTimesByCourse[course.id].map((teeTime) => (
                    <div
                      key={teeTime.id}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div>
                          <strong>{new Date(teeTime.slotTime).toLocaleString()}</strong>
                        </div>
                        <div>
                          Price: R{teeTime.price} | Players: {teeTime.bookedPlayers}/{teeTime.maxPlayers} | Status: {teeTime.status}
                        </div>
                      </div>

                      <button
                        className="btn"
                        style={{ background: "#ef4444", color: "#fff" }}
                        onClick={() => handleDeleteTeeTime(teeTime.id)}
                      >
                        Delete Tee Time
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tee times yet for this course.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 16 }}>All Bookings</h2>

      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search by player, email, course, or status..."
          value={bookingSearch}
          onChange={(e) => setBookingSearch(e.target.value)}
        />

        <select
          value={bookingStatusFilter}
          onChange={(e) => setBookingStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="card"
              style={{
                padding: 18,
                borderRadius: 16,
                display: "grid",
                gap: 8,
              }}
            >
              <div>
                <strong>Player:</strong> {booking.userFullName}
              </div>
              <div>
                <strong>Email:</strong> {booking.userEmail}
              </div>
              <div>
                <strong>Course:</strong> {booking.courseName}
              </div>
              <div>
                <strong>Date & Time:</strong> {new Date(booking.slotTime).toLocaleString()}
              </div>
              <div>
                <strong>Players:</strong> {booking.players}
              </div>
              <div>
                <strong>Total Amount:</strong> R{booking.totalAmount}
              </div>
              <div>
                <strong>Payment Status:</strong> {booking.paymentStatus || "N/A"}
              </div>
              <div>
                <strong>Status:</strong> {booking.status}
              </div>

              {booking.guestNames && booking.guestNames.length > 0 && (
                <div>
                  <strong>Guests:</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {booking.guestNames.map((guest, index) => (
                      <li key={`${booking.id}-guest-${index}`}>{guest}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {booking.status?.toUpperCase() !== "CANCELLED" && (
                  <button
                    className="btn"
                    style={{ background: "#f59e0b", color: "#fff" }}
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}

                <button
                  className="btn"
                  style={{ background: "#ef4444", color: "#fff" }}
                  onClick={() => handleDeleteBooking(booking.id)}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 18 }}>
            No bookings found.
          </div>
        )}
      </div>
    </main>
  );
}