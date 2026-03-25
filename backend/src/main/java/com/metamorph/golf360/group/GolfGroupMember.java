package com.metamorph.golf360.group;

import com.metamorph.golf360.common.BaseEntity;
import com.metamorph.golf360.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "golf_group_members",
        uniqueConstraints = @UniqueConstraint(name = "uk_group_user", columnNames = {"group_id", "user_id"}))
public class GolfGroupMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private GolfGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupMemberRole role = GroupMemberRole.MEMBER;
}
