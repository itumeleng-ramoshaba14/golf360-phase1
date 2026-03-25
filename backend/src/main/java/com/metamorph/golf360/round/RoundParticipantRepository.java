package com.metamorph.golf360.round;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoundParticipantRepository extends JpaRepository<RoundParticipant, UUID> {
    List<RoundParticipant> findByRoundIdOrderByCreatedAtAsc(UUID roundId);
    Optional<RoundParticipant> findByRoundIdAndUserId(UUID roundId, UUID userId);
    boolean existsByRoundIdAndUserId(UUID roundId, UUID userId);
}
