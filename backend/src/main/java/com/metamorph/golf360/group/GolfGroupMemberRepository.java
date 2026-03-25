package com.metamorph.golf360.group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GolfGroupMemberRepository extends JpaRepository<GolfGroupMember, UUID> {
    List<GolfGroupMember> findByUserId(UUID userId);
    List<GolfGroupMember> findByGroupIdOrderByCreatedAtAsc(UUID groupId);
    Optional<GolfGroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);
    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);
    long countByGroupId(UUID groupId);
}
