package com.metamorph.golf360.teetime;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TeeTimeDtos {
    @Data
    @Builder
    public static class TeeTimeResponse {
        private UUID id;
        private UUID courseId;
        private String courseName;
        private LocalDateTime slotTime;
        private Integer maxPlayers;
        private Integer bookedPlayers;
        private Boolean available;
        private Integer availableSpots;
        private BigDecimal price;
        private TeeTimeStatus status;
    }
}