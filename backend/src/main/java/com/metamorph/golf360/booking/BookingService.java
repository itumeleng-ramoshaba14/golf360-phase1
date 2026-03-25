package com.metamorph.golf360.booking;

import com.metamorph.golf360.booking.dto.BookingRequest;
import com.metamorph.golf360.booking.dto.BookingResponse;
import com.metamorph.golf360.teetime.TeeTime;
import com.metamorph.golf360.teetime.TeeTimeRepository;
import com.metamorph.golf360.teetime.TeeTimeStatus;
import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingGuestRepository bookingGuestRepository;
    private final TeeTimeRepository teeTimeRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(UUID teeTimeId, BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TeeTime teeTime = teeTimeRepository.findById(teeTimeId)
                .orElseThrow(() -> new EntityNotFoundException("Tee time not found"));

        int players = request.getPlayers() == null ? 1 : request.getPlayers();
        List<String> guestNames = request.getGuestNames() == null
                ? Collections.emptyList()
                : request.getGuestNames();

        if (players < 1) {
            throw new IllegalArgumentException("Players must be at least 1");
        }

        if (guestNames.size() != players - 1) {
            throw new IllegalArgumentException("Guest names must match the extra number of players");
        }

        boolean hasBlankGuest = guestNames.stream().anyMatch(name -> name == null || name.isBlank());
        if (hasBlankGuest) {
            throw new IllegalArgumentException("Guest names cannot be blank");
        }

        if (!Boolean.TRUE.equals(teeTime.getAvailable())) {
            throw new IllegalStateException("Tee time is not available");
        }

        if (teeTime.getAvailableSpots() == null || teeTime.getAvailableSpots() < players) {
            throw new IllegalStateException("Not enough available spots");
        }

        teeTime.setAvailableSpots(teeTime.getAvailableSpots() - players);
        teeTime.setBookedPlayers((teeTime.getBookedPlayers() == null ? 0 : teeTime.getBookedPlayers()) + players);

        if (teeTime.getAvailableSpots() <= 0) {
            teeTime.setAvailable(false);
            teeTime.setAvailableSpots(0);
            teeTime.setStatus(TeeTimeStatus.FULL);
        } else if (teeTime.getAvailableSpots() < teeTime.getMaxPlayers()) {
            teeTime.setAvailable(true);
            teeTime.setStatus(TeeTimeStatus.LIMITED);
        } else {
            teeTime.setAvailable(true);
            teeTime.setStatus(TeeTimeStatus.AVAILABLE);
        }

        BigDecimal unitPrice = teeTime.getPrice() == null ? BigDecimal.ZERO : teeTime.getPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(players));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setTeeTime(teeTime);
        booking.setPlayers(players);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalAmount(totalAmount);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setNotes(request.getNotes());

        teeTimeRepository.save(teeTime);
        Booking savedBooking = bookingRepository.save(booking);

        for (String guestName : guestNames) {
            BookingGuest guest = new BookingGuest();
            guest.setBooking(savedBooking);
            guest.setGuestName(guestName.trim());
            bookingGuestRepository.save(guest);
        }

        return mapToResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(UUID bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot view this booking");
        }

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse payForBooking(UUID bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot pay for this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled bookings cannot be paid");
        }

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            return mapToResponse(booking);
        }

        booking.setPaymentStatus(PaymentStatus.PAID);
        Booking saved = bookingRepository.save(booking);

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return mapToResponse(booking);
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

        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        List<String> guestNames = bookingGuestRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId())
                .stream()
                .map(BookingGuest::getGuestName)
                .toList();

        return BookingResponse.builder()
                .id(booking.getId())
                .teeTimeId(booking.getTeeTime().getId())
                .courseId(booking.getTeeTime().getCourse().getId())
                .courseName(booking.getTeeTime().getCourse().getName())
                .slotTime(booking.getTeeTime().getSlotTime())
                .players(booking.getPlayers())
                .guestNames(guestNames)
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .totalAmount(booking.getTotalAmount())
                .paymentStatus(booking.getPaymentStatus())
                .notes(booking.getNotes())
                .build();
    }
}