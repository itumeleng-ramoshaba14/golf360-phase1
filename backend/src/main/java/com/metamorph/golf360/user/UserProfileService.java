package com.metamorph.golf360.user;

import com.metamorph.golf360.user.dto.UpdateUserProfileRequest;
import com.metamorph.golf360.user.dto.UserProfileResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return mapToResponse(user);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(String userEmail, UpdateUserProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        user.setPhoneNumber(blankToNull(request.getPhoneNumber()));
        user.setHandicap(request.getHandicap());
        user.setHomeClub(blankToNull(request.getHomeClub()));
        user.setProfileImageUrl(blankToNull(request.getProfileImageUrl()));

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .handicap(user.getHandicap())
                .homeClub(user.getHomeClub())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}