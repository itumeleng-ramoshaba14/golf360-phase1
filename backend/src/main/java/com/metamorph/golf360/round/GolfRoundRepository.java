package com.metamorph.golf360.round;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GolfRoundRepository extends JpaRepository<GolfRound, UUID> {
    List<GolfRound> findDistinctByParticipantsUserIdOrderByCreatedAtDesc(UUID userId);
}
