package com.metamorph.golf360.booking;

import com.metamorph.golf360.booking.dto.AdminBookingResponse;
import com.metamorph.golf360.booking.dto.AdminBookingStatsResponse;
import com.metamorph.golf360.teetime.TeeTime;
import com.metamorph.golf360.teetime.TeeTimeRepository;
import com.metamorph.golf360.teetime.TeeTimeStatus;
import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import com.metamorph.golf360.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingGuestRepository bookingGuestRepository;
    private final TeeTimeRepository teeTimeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminBookingResponse> getAllBookings(String adminEmail, String status, UUID courseId, String search) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view all bookings");
        }

        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        List<Booking> bookings = resolveBookings(status);

        return bookings.stream()
                .filter(booking -> courseId == null || booking.getTeeTime().getCourse().getId().equals(courseId))
                .filter(booking -> matchesSearch(booking, normalizedSearch))
                .map(this::mapToAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminBookingStatsResponse getBookingStats(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view booking stats");
        }

        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();

        long totalBookings = bookings.size();
        long confirmedBookings = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long cancelledBookings = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long paidBookings = bookings.stream().filter(b -> b.getPaymentStatus() == PaymentStatus.PAID).count();
        long pendingPayments = bookings.stream().filter(b -> b.getPaymentStatus() == PaymentStatus.PENDING).count();

        BigDecimal paidRevenue = bookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .map(b -> b.getTotalAmount() == null ? BigDecimal.ZERO : b.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminBookingStatsResponse.builder()
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .paidBookings(paidBookings)
                .pendingPayments(pendingPayments)
                .paidRevenue(paidRevenue)
                .build();
    }

    @Transactional
    public AdminBookingResponse cancelBookingAsAdmin(UUID bookingId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can cancel bookings");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return mapToAdminResponse(booking);
        }

        booking.setStatus(BookingStatus.CANCELLED);

        TeeTime teeTime = booking.getTeeTime();
        int currentAvailable = teeTime.getAvailableSpots() == null ? 0 : teeTime.getAvailableSpots();
        int currentBooked = teeTime.getBookedPlayers() == null ? 0 : teeTime.getBookedPlayers();

        teeTime.setAvailableSpots(currentAvailable + booking.getPlayers());
        teeTime.setBookedPlayers(Math.max(0, currentBooked - booking.getPlayers()));
        teeTime.setAvailable(true);

        if (teeTime.getAvailableSpots() >= teeTime.getMaxPlayers()) {
            teeTime.setStatus(TeeTimeStatus.AVAILABLE);
        } else if (teeTime.getAvailableSpots() > 0) {
            teeTime.setStatus(TeeTimeStatus.LIMITED);
        } else {
            teeTime.setStatus(TeeTimeStatus.FULL);
        }

        teeTimeRepository.save(teeTime);
        bookingRepository.save(booking);

        return mapToAdminResponse(booking);
    }

    @Transactional
    public void deleteBookingAsAdmin(UUID bookingId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can delete bookings");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        TeeTime teeTime = booking.getTeeTime();
        int currentAvailable = teeTime.getAvailableSpots() == null ? 0 : teeTime.getAvailableSpots();
        int currentBooked = teeTime.getBookedPlayers() == null ? 0 : teeTime.getBookedPlayers();

        if (booking.getStatus() != BookingStatus.CANCELLED) {
            teeTime.setAvailableSpots(currentAvailable + booking.getPlayers());
            teeTime.setBookedPlayers(Math.max(0, currentBooked - booking.getPlayers()));
            teeTime.setAvailable(true);

            if (teeTime.getAvailableSpots() >= teeTime.getMaxPlayers()) {
                teeTime.setStatus(TeeTimeStatus.AVAILABLE);
            } else if (teeTime.getAvailableSpots() > 0) {
                teeTime.setStatus(TeeTimeStatus.LIMITED);
            } else {
                teeTime.setStatus(TeeTimeStatus.FULL);
            }

            teeTimeRepository.save(teeTime);
        }

        bookingGuestRepository.deleteAll(bookingGuestRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId()));
        bookingRepository.delete(booking);
    }

    private List<Booking> resolveBookings(String status) {
        if (status == null || status.isBlank()) {
            return bookingRepository.findAllByOrderByCreatedAtDesc();
        }

        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            return bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus);
        } catch (IllegalArgumentException ex) {
            return bookingRepository.findAllByOrderByCreatedAtDesc();
        }
    }

    private boolean matchesSearch(Booking booking, String normalizedSearch) {
        if (normalizedSearch.isBlank())
            return true;

        String courseName = safeLower(booking.getTeeTime().getCourse().getName());
        String userFullName = safeLower(booking.getUser().getFullName());
        String userEmail = safeLower(booking.getUser().getEmail());

        return courseName.contains(normalizedSearch)
                || userFullName.contains(normalizedSearch)
                || userEmail.contains(normalizedSearch);
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private AdminBookingResponse mapToAdminResponse(Booking booking) {
        List<String> guestNames = bookingGuestRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId())
                .stream()
                .map(BookingGuest::getGuestName)
                .toList();

        return AdminBookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userFullName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .courseId(booking.getTeeTime().getCourse().getId())
                .courseName(booking.getTeeTime().getCourse().getName())
                .slotTime(booking.getTeeTime().getSlotTime())
                .players(booking.getPlayers())
                .guestNames(guestNames)
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}