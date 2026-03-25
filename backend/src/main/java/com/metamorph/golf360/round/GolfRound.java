package com.metamorph.golf360.round;

import com.metamorph.golf360.common.BaseEntity;
import com.metamorph.golf360.course.Course;
import com.metamorph.golf360.group.GolfGroup;
import com.metamorph.golf360.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "golf_rounds")
public class GolfRound extends BaseEntity {

    @OneToMany(mappedBy = "round")
    private List<RoundParticipant> participants = new ArrayList<>();

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private GolfGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameFormat format = GameFormat.STROKE_PLAY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundStatus status = RoundStatus.ACTIVE;
}
