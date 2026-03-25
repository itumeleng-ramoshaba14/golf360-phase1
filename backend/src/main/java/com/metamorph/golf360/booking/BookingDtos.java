package com.metamorph.golf360.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class BookingDtos {
    @Data
    public static class CreateBookingRequest {
        @NotBlank
        private String playerEmail;
        @NotNull
        private UUID teeTimeId;
        @Min(1)
        private Integer playersCount;
    }

    @Data
    @Builder
    public static class BookingResponse {
        private UUID bookingId;
        private String playerName;
        private String playerEmail;
        private String clubName;
        private String courseName;
        private LocalDateTime teeTime;
        private Integer playersCount;
        private BigDecimal totalAmount;
        private BookingStatus status;
    }
}

