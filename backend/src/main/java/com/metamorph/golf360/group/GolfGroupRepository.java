package com.metamorph.golf360.group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GolfGroupRepository extends JpaRepository<GolfGroup, UUID> {
    List<GolfGroup> findByCreatedById(UUID userId);
}
