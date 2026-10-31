package com.vr.taskflow.dto.comment;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(

        @NotBlank(message = "Comment content cannot be empty")
        String content
) {}

