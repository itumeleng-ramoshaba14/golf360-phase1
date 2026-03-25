package com.metamorph.golf360.booking;

import com.metamorph.golf360.booking.dto.BookingRequest;
import com.metamorph.golf360.booking.dto.BookingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/tee-times/{teeTimeId}")
    public BookingResponse createBooking(@PathVariable UUID teeTimeId,
            @RequestBody BookingRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to book a tee time");
        }

        return bookingService.createBooking(teeTimeId, request, authentication.getName());
    }

    @GetMapping("/me")
    public List<BookingResponse> myBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to view bookings");
        }

        return bookingService.getMyBookings(authentication.getName());
    }

    @GetMapping("/{bookingId}")
    public BookingResponse getBookingById(@PathVariable UUID bookingId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to view booking details");
        }

        return bookingService.getBookingById(bookingId, authentication.getName());
    }

    @PatchMapping("/{bookingId}/pay")
    public BookingResponse payForBooking(@PathVariable UUID bookingId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to pay for a booking");
        }

        return bookingService.payForBooking(bookingId, authentication.getName());
    }

    @PatchMapping("/{bookingId}/cancel")
    public BookingResponse cancelBooking(@PathVariable UUID bookingId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to cancel a booking");
        }

        return bookingService.cancelBooking(bookingId, authentication.getName());
    }
}