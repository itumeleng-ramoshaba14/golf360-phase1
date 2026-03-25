package com.metamorph.golf360.dashboard;

import com.metamorph.golf360.group.GolfGroupMemberRepository;
import com.metamorph.golf360.round.GolfRoundService;
import com.metamorph.golf360.round.RoundDtos;
import com.metamorph.golf360.round.RoundStatus;
import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final GolfGroupMemberRepository golfGroupMemberRepository;
    private final GolfRoundService golfRoundService;

    @Transactional(readOnly = true)
    public DashboardDtos.DashboardResponse getMyDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<RoundDtos.RoundSummaryResponse> rounds = golfRoundService.getMyRounds(userEmail);
        List<RoundDtos.RoundDetailResponse> completedRoundDetails = rounds.stream()
                .filter(round -> round.getStatus() == RoundStatus.COMPLETED)
                .map(round -> golfRoundService.getRound(round.getId(), userEmail))
                .toList();

        List<Integer> myCompletedScores = completedRoundDetails.stream()
                .flatMap(round -> round.getParticipants().stream()
                        .filter(participant -> user.getId().equals(participant.getUserId()))
                        .filter(participant -> participant.getTotalStrokes() != null)
                        .map(RoundDtos.RoundParticipantResponse::getTotalStrokes))
                .toList();

        Integer bestRound = myCompletedScores.stream().min(Integer::compareTo).orElse(null);
        Double averageScore = myCompletedScores.isEmpty()
                ? null
                : Math.round(myCompletedScores.stream().mapToInt(Integer::intValue).average().orElse(0.0) * 10.0) / 10.0;

        long wins = completedRoundDetails.stream()
                .filter(round -> round.getLeader() != null && user.getId().equals(round.getLeader().getUserId()))
                .count();

        double winRate = completedRoundDetails.isEmpty() ? 0.0 : (wins * 100.0) / completedRoundDetails.size();

        return DashboardDtos.DashboardResponse.builder()
                .fullName(user.getFullName())
                .handicap(user.getHandicap())
                .totalRounds(rounds.size())
                .completedRounds(completedRoundDetails.size())
                .bestRound(bestRound)
                .averageScore(averageScore)
                .winRate(Math.round(winRate * 10.0) / 10.0)
                .golfGroups((int) golfGroupMemberRepository.findByUserId(user.getId()).size())
                .recentRounds(rounds.stream().limit(5).toList())
                .build();
    }
}
