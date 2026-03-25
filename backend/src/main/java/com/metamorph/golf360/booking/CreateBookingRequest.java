package com.metamorph.golf360.booking;

import java.util.UUID;

public class CreateBookingRequest {
    private UUID userId;
    private UUID teeTimeId;
    private Integer playersCount;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getTeeTimeId() {
        return teeTimeId;
    }

    public void setTeeTimeId(UUID teeTimeId) {
        this.teeTimeId = teeTimeId;
    }

    public Integer getPlayersCount() {
        return playersCount;
    }

    public void setPlayersCount(Integer playersCount) {
        this.playersCount = playersCount;
    }
}