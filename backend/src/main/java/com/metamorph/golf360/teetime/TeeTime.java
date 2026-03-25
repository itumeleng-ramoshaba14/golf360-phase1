package com.metamorph.golf360.teetime;

import com.metamorph.golf360.common.BaseEntity;
import com.metamorph.golf360.course.Course;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tee_times")
public class TeeTime extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime slotTime;

    @Column(nullable = false)
    private Integer maxPlayers;

    @Column(nullable = false)
    private Integer bookedPlayers = 0;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false)
    private Integer availableSpots = 4;

    @Column(nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeeTimeStatus status = TeeTimeStatus.AVAILABLE;
}