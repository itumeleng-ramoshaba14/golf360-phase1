package com.metamorph.golf360.booking.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminBookingStatsResponse {
    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long paidBookings;
    private long pendingPayments;
    private BigDecimal paidRevenue;
}