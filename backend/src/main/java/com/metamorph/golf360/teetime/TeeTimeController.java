package com.metamorph.golf360.teetime;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3005")
public class TeeTimeController {
    private final TeeTimeService teeTimeService;

    @GetMapping("/api/courses/{courseId}/tee-times")
    public List<TeeTimeDtos.TeeTimeResponse> getTeeTimes(@PathVariable UUID courseId) {
        return teeTimeService.getByCourse(courseId);
    }

    @PostMapping("/api/courses/{courseId}/tee-times")
    public TeeTimeDtos.TeeTimeResponse createTeeTime(
            @PathVariable UUID courseId,
            @RequestBody CreateTeeTimeRequest request) {
        return teeTimeService.createTeeTime(courseId, request);
    }

    @GetMapping("/api/tee-times/course/{courseId}")
    public List<TeeTimeDtos.TeeTimeResponse> getTeeTimesForAdmin(@PathVariable UUID courseId) {
        return teeTimeService.getByCourse(courseId);
    }

    @DeleteMapping("/api/tee-times/{teeTimeId}")
    public void deleteTeeTime(@PathVariable UUID teeTimeId) {
        teeTimeService.deleteTeeTime(teeTimeId);
    }
}