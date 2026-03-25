package com.metamorph.golf360.user.dto;

import com.metamorph.golf360.user.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {
    private UUID id;
    private String fullName;
    private String email;
    private UserRole role;
    private String phoneNumber;
    private Double handicap;
    private String homeClub;
    private String profileImageUrl;
}