package com.vr.taskflow.dto.auth;

import java.util.Set;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Long userId,
        String username,
        String email,
        String fullName,
        Set<String> roles
) {
    public static AuthResponse of(String token, Long userId, String username,
                                  String email, String fullName, Set<String> roles) {
        return new AuthResponse(token, "Bearer", userId, username, email, fullName, roles);
    }
}

