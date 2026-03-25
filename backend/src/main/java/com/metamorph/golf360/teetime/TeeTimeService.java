package com.metamorph.golf360.teetime;

import com.metamorph.golf360.course.Course;
import com.metamorph.golf360.course.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeeTimeService {
    private final TeeTimeRepository teeTimeRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<TeeTimeDtos.TeeTimeResponse> getByCourse(UUID courseId) {
        return teeTimeRepository.findByCourseIdOrderBySlotTimeAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TeeTimeDtos.TeeTimeResponse createTeeTime(UUID courseId, CreateTeeTimeRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        TeeTime teeTime = new TeeTime();
        teeTime.setCourse(course);
        teeTime.setSlotTime(request.getSlotTime());
        teeTime.setMaxPlayers(request.getMaxPlayers());
        teeTime.setBookedPlayers(0);
        teeTime.setAvailable(true);
        teeTime.setAvailableSpots(request.getMaxPlayers());
        teeTime.setPrice(request.getPrice());
        teeTime.setStatus(TeeTimeStatus.AVAILABLE);

        TeeTime saved = teeTimeRepository.save(teeTime);
        return toResponse(saved);
    }

    @Transactional
    public void deleteTeeTime(UUID teeTimeId) {
        TeeTime teeTime = teeTimeRepository.findById(teeTimeId)
                .orElseThrow(() -> new RuntimeException("Tee time not found"));

        if (teeTime.getBookedPlayers() != null && teeTime.getBookedPlayers() > 0) {
            throw new RuntimeException("Cannot delete tee time with existing bookings");
        }

        teeTimeRepository.delete(teeTime);
    }

    private TeeTimeDtos.TeeTimeResponse toResponse(TeeTime teeTime) {
        return TeeTimeDtos.TeeTimeResponse.builder()
                .id(teeTime.getId())
                .courseId(teeTime.getCourse().getId())
                .courseName(teeTime.getCourse().getName())
                .slotTime(teeTime.getSlotTime())
                .maxPlayers(teeTime.getMaxPlayers())
                .bookedPlayers(teeTime.getBookedPlayers())
                .available(teeTime.getAvailable())
                .availableSpots(teeTime.getAvailableSpots())
                .price(teeTime.getPrice())
                .status(teeTime.getStatus())
                .build();
    }
}