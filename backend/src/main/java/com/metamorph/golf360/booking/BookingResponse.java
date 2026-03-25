package com.metamorph.golf360.booking;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String courseName;
    private LocalDateTime slotTime;
    private Integer playersCount;
    private BigDecimal totalAmount;
    private String status;
}