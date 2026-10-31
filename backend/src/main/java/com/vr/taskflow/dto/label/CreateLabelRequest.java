package com.vr.taskflow.dto.label;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLabelRequest(

        @NotBlank(message = "Label name is required")
        @Size(max = 100, message = "Label name must not exceed 100 characters")
        String name,

        @Size(max = 20, message = "Color code must not exceed 20 characters")
        String color
) {}

