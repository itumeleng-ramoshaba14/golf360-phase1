package com.metamorph.golf360.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingGuestRepository extends JpaRepository<BookingGuest, UUID> {
    List<BookingGuest> findByBookingIdOrderByCreatedAtAsc(UUID bookingId);
}