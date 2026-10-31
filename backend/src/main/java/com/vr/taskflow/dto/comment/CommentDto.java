package com.vr.taskflow.dto.comment;

import com.vr.taskflow.dto.user.UserDto;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        Long issueId,
        UserDto author,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

