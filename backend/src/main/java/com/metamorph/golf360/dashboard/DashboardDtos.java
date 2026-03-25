package com.metamorph.golf360.dashboard;

import com.metamorph.golf360.round.RoundDtos;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

public class DashboardDtos {

    @Getter
    @Builder
    public static class DashboardResponse {
        private String fullName;
        private Double handicap;
        private Integer totalRounds;
        private Integer completedRounds;
        private Integer bestRound;
        private Double averageScore;
        private Double winRate;
        private Integer golfGroups;
        private List<RoundDtos.RoundSummaryResponse> recentRounds;
    }
}
