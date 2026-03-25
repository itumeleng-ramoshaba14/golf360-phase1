package com.metamorph.golf360.group;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

public class GolfGroupDtos {

    @Getter
    @Setter
    public static class CreateGroupRequest {
        private String name;
        private String description;
        private String scheduleLabel;
        private String homeCourseName;
    }

    @Getter
    @Setter
    public static class AddMemberRequest {
        private String email;
    }

    @Getter
    @Builder
    public static class GroupMemberResponse {
        private UUID userId;
        private String fullName;
        private String email;
        private GroupMemberRole role;
        private Double handicap;
    }

    @Getter
    @Builder
    public static class GroupResponse {
        private UUID id;
        private String name;
        private String description;
        private String scheduleLabel;
        private String homeCourseName;
        private UUID createdByUserId;
        private String createdByName;
        private long memberCount;
        private List<GroupMemberResponse> members;
    }
}
