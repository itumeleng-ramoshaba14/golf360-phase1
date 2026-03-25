package com.metamorph.golf360.booking;

import com.metamorph.golf360.booking.dto.AdminBookingResponse;
import com.metamorph.golf360.booking.dto.AdminBookingStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping({ "/api/admin/bookings", "/api/bookings/admin" })
    public List<AdminBookingResponse> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        return adminBookingService.getAllBookings(authentication.getName(), status, courseId, search);
    }

    @GetMapping({ "/api/admin/bookings/stats", "/api/bookings/admin/stats" })
    public AdminBookingStatsResponse getBookingStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        return adminBookingService.getBookingStats(authentication.getName());
    }

    @PatchMapping({ "/api/admin/bookings/{bookingId}/cancel", "/api/bookings/admin/{bookingId}/cancel" })
    public AdminBookingResponse cancelBookingAsAdmin(
            @PathVariable UUID bookingId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        return adminBookingService.cancelBookingAsAdmin(bookingId, authentication.getName());
    }

    @DeleteMapping({ "/api/admin/bookings/{bookingId}", "/api/bookings/admin/{bookingId}" })
    public void deleteBookingAsAdmin(
            @PathVariable UUID bookingId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        adminBookingService.deleteBookingAsAdmin(bookingId, authentication.getName());
    }
}