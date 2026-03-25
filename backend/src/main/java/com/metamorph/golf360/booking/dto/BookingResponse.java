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
public class BookingResponse {
    private UUID id;
    private UUID teeTimeId;
    private UUID courseId;
    private String courseName;
    private LocalDateTime slotTime;
    private Integer players;
    private List<String> guestNames;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private String notes;
}