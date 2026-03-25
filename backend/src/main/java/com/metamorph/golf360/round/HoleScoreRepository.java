package com.metamorph.golf360.round;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HoleScoreRepository extends JpaRepository<HoleScore, UUID> {
    List<HoleScore> findByParticipantRoundIdOrderByParticipantCreatedAtAscHoleNumberAsc(UUID roundId);
    List<HoleScore> findByParticipantIdOrderByHoleNumberAsc(UUID participantId);
    Optional<HoleScore> findByParticipantIdAndHoleNumber(UUID participantId, Integer holeNumber);
}
