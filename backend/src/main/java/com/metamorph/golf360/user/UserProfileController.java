package com.metamorph.golf360.user;

import com.metamorph.golf360.user.dto.UpdateUserProfileRequest;
import com.metamorph.golf360.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        return userProfileService.getMyProfile(authentication.getName());
    }

    @PatchMapping("/me")
    public UserProfileResponse updateMyProfile(@RequestBody UpdateUserProfileRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in");
        }

        return userProfileService.updateMyProfile(authentication.getName(), request);
    }
}