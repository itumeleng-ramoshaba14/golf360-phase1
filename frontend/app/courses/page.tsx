"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type Course = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  city?: string;
  province?: string;
  country?: string;
};

export default function CoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to load courses", error);
      showToast(error?.response?.data?.message || "Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((course) => {
      const combined = [
        course.name,
        course.description,
        course.city,
        course.province,
        course.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combined.includes(q);
    });
  }, [courses, search]);

  return (
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Courses
      </h1>
      <p style={{ color: "#cbd5e1", marginBottom: "20px" }}>
        Browse available golf courses and open tee times.
      </p>

      <div style={{ marginBottom: "24px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by name, city, province, or country"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <div
          style={{
            border: "1px solid #2a3a5a",
            borderRadius: "14px",
            padding: "20px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <p>No courses matched your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                border: "1px solid #2a3a5a",
                borderRadius: "14px",
                padding: "18px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>{course.name}</h2>

              {course.description && (
                <p style={{ color: "#cbd5e1", marginBottom: "10px" }}>{course.description}</p>
              )}

              <div style={{ display: "grid", gap: "6px", marginBottom: "14px" }}>
                {course.city && <p><strong>City:</strong> {course.city}</p>}
                {course.province && <p><strong>Province:</strong> {course.province}</p>}
                {course.country && <p><strong>Country:</strong> {course.country}</p>}
              </div>

              <Link
                href={`/courses/${course.id}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                View Tee Times
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}