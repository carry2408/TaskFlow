package com.vr.taskflow.dto.sprint;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SprintDto(
        Long id,
        Long projectId,
        String name,
        String goal,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        LocalDateTime createdAt
) {}

