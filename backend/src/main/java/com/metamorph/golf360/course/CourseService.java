package com.metamorph.golf360.course;

import com.metamorph.golf360.teetime.TeeTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TeeTimeRepository teeTimeRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(CreateCourseRequest request) {
        try {
            Course course = new Course();
            course.setName(request.getName());
            course.setCity(request.getCity());
            course.setProvince(request.getProvince());
            course.setCountry(request.getCountry());
            course.setDescription(request.getDescription());
            course.setImageUrl(request.getImageUrl());
            course.setHoles(request.getHoles());

            System.out.println("Creating course:");
            System.out.println("Name: " + request.getName());
            System.out.println("City: " + request.getCity());
            System.out.println("Province: " + request.getProvince());
            System.out.println("Country: " + request.getCountry());
            System.out.println("Description: " + request.getDescription());
            System.out.println("Image URL: " + request.getImageUrl());
            System.out.println("Holes: " + request.getHoles());

            Course saved = courseRepository.save(course);
            System.out.println("Course created successfully with ID: " + saved.getId());

            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create course: " + e.getMessage(), e);
        }
    }

    public void deleteCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!teeTimeRepository.findByCourseIdOrderBySlotTimeAsc(courseId).isEmpty()) {
            throw new RuntimeException("Cannot delete course with existing tee times");
        }

        courseRepository.delete(course);
    }
}