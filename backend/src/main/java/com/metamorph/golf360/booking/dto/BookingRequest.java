package com.metamorph.golf360.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingRequest {
    private Integer players;
    private List<String> guestNames;
    private String notes;
}