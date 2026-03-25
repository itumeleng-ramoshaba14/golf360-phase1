package com.metamorph.golf360.booking.dto;

import com.metamorph.golf360.booking.BookingStatus;
import com.metamorph.golf360.booking.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class AdminBookingResponse {
    private UUID id;
    private UUID userId;
    private String userFullName;
    private String userEmail;
    private UUID courseId;
    private String courseName;
    private LocalDateTime slotTime;
    private Integer players;
    private List<String> guestNames;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}