package com.metamorph.golf360.teetime;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateTeeTimeRequest {
    private LocalDateTime slotTime;
    private Integer maxPlayers;
    private BigDecimal price;
}