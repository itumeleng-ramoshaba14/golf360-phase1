package com.metamorph.golf360.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileRequest {
    private String fullName;
    private String phoneNumber;
    private Double handicap;
    private String homeClub;
    private String profileImageUrl;
}