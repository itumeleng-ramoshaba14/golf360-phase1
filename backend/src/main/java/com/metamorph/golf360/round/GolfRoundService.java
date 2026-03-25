package com.metamorph.golf360.round;

import com.metamorph.golf360.course.Course;
import com.metamorph.golf360.course.CourseRepository;
import com.metamorph.golf360.group.GolfGroup;
import com.metamorph.golf360.group.GolfGroupMember;
import com.metamorph.golf360.group.GolfGroupMemberRepository;
import com.metamorph.golf360.group.GolfGroupRepository;
import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GolfRoundService {

    private final GolfRoundRepository golfRoundRepository;
    private final RoundParticipantRepository roundParticipantRepository;
    private final HoleScoreRepository holeScoreRepository;
    private final CourseRepository courseRepository;
    private final GolfGroupRepository golfGroupRepository;
    private final GolfGroupMemberRepository golfGroupMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoundDtos.RoundSummaryResponse> getMyRounds(String userEmail) {
        User user = getUserByEmail(userEmail);
        return golfRoundRepository.findDistinctByParticipantsUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoundDtos.RoundDetailResponse getRound(UUID roundId, String userEmail) {
        User user = getUserByEmail(userEmail);
        ensureRoundAccess(roundId, user.getId());
        GolfRound round = golfRoundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found"));
        return toDetail(round);
    }

    @Transactional
    public RoundDtos.RoundDetailResponse createRound(RoundDtos.CreateRoundRequest request, String userEmail) {
        User creator = getUserByEmail(userEmail);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Round name is required");
        }

        GolfRound round = new GolfRound();
        round.setName(request.getName().trim());
        round.setCreatedBy(creator);
        round.setScheduledAt(request.getScheduledAt());
        round.setFormat(request.getFormat() == null ? GameFormat.STROKE_PLAY : request.getFormat());
        round.setStatus(RoundStatus.ACTIVE);

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new EntityNotFoundException("Course not found"));
            round.setCourse(course);
        }

        LinkedHashMap<UUID, User> participants = new LinkedHashMap<>();
        participants.put(creator.getId(), creator);

        if (request.getGroupId() != null) {
            GolfGroup group = golfGroupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group not found"));

            if (!golfGroupMemberRepository.existsByGroupIdAndUserId(group.getId(), creator.getId())) {
                throw new IllegalArgumentException("You must belong to the selected group");
            }

            round.setGroup(group);

            List<GolfGroupMember> groupMembers = golfGroupMemberRepository
                    .findByGroupIdOrderByCreatedAtAsc(group.getId());

            for (GolfGroupMember member : groupMembers) {
                participants.put(member.getUser().getId(), member.getUser());
            }
        }

        if (request.getParticipantUserIds() != null) {
            for (UUID userId : request.getParticipantUserIds()) {
                User player = userRepository.findById(userId)
                        .orElseThrow(() -> new EntityNotFoundException("Player not found: " + userId));
                participants.put(player.getId(), player);
            }
        }

        GolfRound savedRound = golfRoundRepository.save(round);

        for (User player : participants.values()) {
            RoundParticipant participant = new RoundParticipant();
            participant.setRound(savedRound);
            participant.setUser(player);
            participant.setDisplayName(player.getFullName());
            participant.setHandicap(player.getHandicap());
            roundParticipantRepository.save(participant);
        }

        if (request.getGuestNames() != null) {
            for (String guestName : request.getGuestNames()) {
                if (guestName == null || guestName.isBlank()) {
                    continue;
                }

                RoundParticipant guestParticipant = new RoundParticipant();
                guestParticipant.setRound(savedRound);
                guestParticipant.setDisplayName(guestName.trim());
                roundParticipantRepository.save(guestParticipant);
            }
        }

        return toDetail(savedRound);
    }

    @Transactional
    public RoundDtos.RoundDetailResponse submitScores(UUID roundId,
            RoundDtos.SubmitScoresRequest request,
            String userEmail) {
        User user = getUserByEmail(userEmail);
        ensureRoundAccess(roundId, user.getId());

        GolfRound round = golfRoundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found"));

        if (request.getScores() == null || request.getScores().isEmpty()) {
            throw new IllegalArgumentException("At least one score entry is required");
        }

        for (RoundDtos.ScoreEntryRequest entry : request.getScores()) {
            if (entry.getParticipantId() == null || entry.getHoleNumber() == null || entry.getStrokes() == null) {
                throw new IllegalArgumentException(
                        "Each score entry must include participantId, holeNumber, and strokes");
            }
            if (entry.getHoleNumber() < 1 || entry.getHoleNumber() > 18) {
                throw new IllegalArgumentException("Hole number must be between 1 and 18");
            }
            if (entry.getStrokes() < 1 || entry.getStrokes() > 20) {
                throw new IllegalArgumentException("Strokes must be between 1 and 20");
            }

            RoundParticipant participant = roundParticipantRepository.findById(entry.getParticipantId())
                    .orElseThrow(() -> new EntityNotFoundException("Participant not found"));

            if (!participant.getRound().getId().equals(roundId)) {
                throw new IllegalArgumentException("Participant does not belong to this round");
            }

            HoleScore holeScore = holeScoreRepository
                    .findByParticipantIdAndHoleNumber(participant.getId(), entry.getHoleNumber())
                    .orElseGet(HoleScore::new);

            holeScore.setParticipant(participant);
            holeScore.setHoleNumber(entry.getHoleNumber());
            holeScore.setStrokes(entry.getStrokes());
            holeScoreRepository.save(holeScore);
        }

        if (round.getStatus() == RoundStatus.DRAFT) {
            round.setStatus(RoundStatus.ACTIVE);
        }

        return toDetail(round);
    }

    @Transactional
    public RoundDtos.RoundDetailResponse completeRound(UUID roundId, String userEmail) {
        User user = getUserByEmail(userEmail);
        ensureRoundAccess(roundId, user.getId());

        GolfRound round = golfRoundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found"));
        round.setStatus(RoundStatus.COMPLETED);

        return toDetail(round);
    }

    private void ensureRoundAccess(UUID roundId, UUID userId) {
        if (!roundParticipantRepository.existsByRoundIdAndUserId(roundId, userId)) {
            GolfRound round = golfRoundRepository.findById(roundId)
                    .orElseThrow(() -> new EntityNotFoundException("Round not found"));
            if (!round.getCreatedBy().getId().equals(userId)) {
                throw new IllegalArgumentException("You do not have access to this round");
            }
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private RoundDtos.RoundSummaryResponse toSummary(GolfRound round) {
        List<RoundDtos.RoundParticipantResponse> participants = buildParticipantResponses(round.getId());

        Integer leaderScore = participants.stream()
                .map(RoundDtos.RoundParticipantResponse::getTotalStrokes)
                .filter(Objects::nonNull)
                .min(Integer::compareTo)
                .orElse(null);

        return RoundDtos.RoundSummaryResponse.builder()
                .id(round.getId())
                .name(round.getName())
                .courseId(round.getCourse() != null ? round.getCourse().getId() : null)
                .courseName(round.getCourse() != null ? round.getCourse().getName() : null)
                .groupId(round.getGroup() != null ? round.getGroup().getId() : null)
                .groupName(round.getGroup() != null ? round.getGroup().getName() : null)
                .scheduledAt(round.getScheduledAt())
                .format(round.getFormat())
                .status(round.getStatus())
                .participantCount(participants.size())
                .createdByName(round.getCreatedBy() != null ? round.getCreatedBy().getFullName() : null)
                .leaderScore(leaderScore)
                .build();
    }

    private RoundDtos.RoundDetailResponse toDetail(GolfRound round) {
        List<RoundDtos.RoundParticipantResponse> participants = buildParticipantResponses(round.getId());

        RoundDtos.RoundParticipantResponse leader = participants.stream()
                .filter(participant -> participant.getTotalStrokes() != null)
                .min(Comparator.comparing(RoundDtos.RoundParticipantResponse::getTotalStrokes))
                .orElse(null);

        return RoundDtos.RoundDetailResponse.builder()
                .id(round.getId())
                .name(round.getName())
                .courseId(round.getCourse() != null ? round.getCourse().getId() : null)
                .courseName(round.getCourse() != null ? round.getCourse().getName() : null)
                .groupId(round.getGroup() != null ? round.getGroup().getId() : null)
                .groupName(round.getGroup() != null ? round.getGroup().getName() : null)
                .scheduledAt(round.getScheduledAt())
                .format(round.getFormat())
                .status(round.getStatus())
                .createdByName(round.getCreatedBy() != null ? round.getCreatedBy().getFullName() : null)
                .participants(participants)
                .leader(leader)
                .build();
    }

    private List<RoundDtos.RoundParticipantResponse> buildParticipantResponses(UUID roundId) {
        List<RoundParticipant> participants = roundParticipantRepository.findByRoundIdOrderByCreatedAtAsc(roundId);
        List<HoleScore> scores = holeScoreRepository
                .findByParticipantRoundIdOrderByParticipantCreatedAtAscHoleNumberAsc(roundId);

        Map<UUID, List<HoleScore>> scoresByParticipant = scores.stream()
                .collect(Collectors.groupingBy(
                        score -> score.getParticipant().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<RoundDtos.RoundParticipantResponse> responses = new ArrayList<>();

        for (RoundParticipant participant : participants) {
            List<HoleScore> participantScores = scoresByParticipant.getOrDefault(participant.getId(), List.of());

            int holesPlayed = participantScores.size();
            Integer totalStrokes = participantScores.isEmpty()
                    ? null
                    : participantScores.stream()
                            .map(HoleScore::getStrokes)
                            .reduce(0, Integer::sum);

            List<RoundDtos.HoleScoreResponse> holeScoreResponses = participantScores.stream()
                    .map(score -> RoundDtos.HoleScoreResponse.builder()
                            .holeNumber(score.getHoleNumber())
                            .strokes(score.getStrokes())
                            .build())
                    .toList();

            responses.add(RoundDtos.RoundParticipantResponse.builder()
                    .participantId(participant.getId())
                    .userId(participant.getUser() != null ? participant.getUser().getId() : null)
                    .displayName(participant.getDisplayName())
                    .handicap(participant.getHandicap())
                    .holesPlayed(holesPlayed)
                    .totalStrokes(totalStrokes)
                    .holeScores(holeScoreResponses)
                    .build());
        }

        List<RoundDtos.RoundParticipantResponse> ranked = responses.stream()
                .sorted(Comparator
                        .comparing((RoundDtos.RoundParticipantResponse p) -> p.getTotalStrokes() == null
                                ? Integer.MAX_VALUE
                                : p.getTotalStrokes())
                        .thenComparing(RoundDtos.RoundParticipantResponse::getDisplayName,
                                String.CASE_INSENSITIVE_ORDER))
                .toList();

        Map<UUID, Integer> positions = new HashMap<>();
        for (int i = 0; i < ranked.size(); i++) {
            positions.put(ranked.get(i).getParticipantId(), i + 1);
        }

        return responses.stream()
                .map(response -> RoundDtos.RoundParticipantResponse.builder()
                        .participantId(response.getParticipantId())
                        .userId(response.getUserId())
                        .displayName(response.getDisplayName())
                        .handicap(response.getHandicap())
                        .holesPlayed(response.getHolesPlayed())
                        .totalStrokes(response.getTotalStrokes())
                        .position(positions.get(response.getParticipantId()))
                        .holeScores(response.getHoleScores())
                        .build())
                .sorted(Comparator.comparing(RoundDtos.RoundParticipantResponse::getPosition))
                .toList();
    }
}