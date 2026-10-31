package com.vr.taskflow.dto.notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String type,
        String title,
        String message,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {}

