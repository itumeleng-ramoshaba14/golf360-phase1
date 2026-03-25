package com.metamorph.golf360.round;

import com.metamorph.golf360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "hole_scores",
        uniqueConstraints = @UniqueConstraint(name = "uk_participant_hole", columnNames = {"participant_id", "hole_number"}))
public class HoleScore extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private RoundParticipant participant;

    @Column(name = "hole_number", nullable = false)
    private Integer holeNumber;

    @Column(nullable = false)
    private Integer strokes;
}
