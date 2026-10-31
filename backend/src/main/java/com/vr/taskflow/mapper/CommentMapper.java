package com.vr.taskflow.mapper;

import com.vr.taskflow.dto.comment.CommentDto;
import com.vr.taskflow.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    private final UserMapper userMapper;

    public CommentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public CommentDto toDto(Comment comment) {
        if (comment == null) {
            return null;
        }

        return new CommentDto(
                comment.getId(),
                comment.getIssue().getId(),
                userMapper.toDto(comment.getAuthor()),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}

