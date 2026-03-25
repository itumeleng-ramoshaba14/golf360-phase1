package com.metamorph.golf360.round;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RoundDtos {

    @Getter
    @Setter
    public static class CreateRoundRequest {
        private String name;
        private UUID courseId;
        private UUID groupId;
        private LocalDateTime scheduledAt;
        private GameFormat format = GameFormat.STROKE_PLAY;
        private List<UUID> participantUserIds;
        private List<String> guestNames;
    }

    @Getter
    @Setter
    public static class ScoreEntryRequest {
        private UUID participantId;
        private Integer holeNumber;
        private Integer strokes;
    }

    @Getter
    @Setter
    public static class SubmitScoresRequest {
        private List<ScoreEntryRequest> scores;
    }

    @Getter
    @Builder
    public static class HoleScoreResponse {
        private Integer holeNumber;
        private Integer strokes;
    }

    @Getter
    @Builder
    public static class RoundParticipantResponse {
        private UUID participantId;
        private UUID userId;
        private String displayName;
        private Double handicap;
        private Integer holesPlayed;
        private Integer totalStrokes;
        private Integer position;
        private List<HoleScoreResponse> holeScores;
    }

    @Getter
    @Builder
    public static class RoundSummaryResponse {
        private UUID id;
        private String name;
        private String courseName;
        private UUID courseId;
        private UUID groupId;
        private String groupName;
        private LocalDateTime scheduledAt;
        private GameFormat format;
        private RoundStatus status;
        private Integer participantCount;
        private String createdByName;
        private Integer leaderScore;
    }

    @Getter
    @Builder
    public static class RoundDetailResponse {
        private UUID id;
        private String name;
        private String courseName;
        private UUID courseId;
        private UUID groupId;
        private String groupName;
        private LocalDateTime scheduledAt;
        private GameFormat format;
        private RoundStatus status;
        private String createdByName;
        private List<RoundParticipantResponse> participants;
        private RoundParticipantResponse leader;
    }
}
