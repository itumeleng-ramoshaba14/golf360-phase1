package com.metamorph.golf360.group;

import com.metamorph.golf360.common.BaseEntity;
import com.metamorph.golf360.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "golf_groups")
public class GolfGroup extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String scheduleLabel;

    private String homeCourseName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;
}
