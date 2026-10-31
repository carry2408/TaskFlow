package com.vr.taskflow.mapper;

import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.entity.Role;
import com.vr.taskflow.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        Set<String> roleNames = user.getRoles() == null ? Set.of() :
                user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet());

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                roleNames
        );
    }
}

