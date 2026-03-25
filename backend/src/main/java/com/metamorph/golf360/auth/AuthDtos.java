package com.metamorph.golf360.auth;

import com.metamorph.golf360.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

public class AuthDtos {
    @Data
    public static class RegisterRequest {
        @NotBlank
        private String fullName;

        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;

        @NotNull
        private UserRole role;
    }

    @Data
    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private UUID userId;
        private String token;
        private String fullName;
        private String email;
        private UserRole role;
    }
}