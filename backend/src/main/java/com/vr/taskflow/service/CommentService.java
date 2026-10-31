package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.comment.CommentDto;
import com.vr.taskflow.dto.comment.CreateCommentRequest;
import com.vr.taskflow.entity.Comment;
import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.CommentMapper;
import com.vr.taskflow.repository.CommentRepository;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    public CommentService(CommentRepository commentRepository,
                          IssueRepository issueRepository,
                          UserRepository userRepository,
                          CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.commentMapper = commentMapper;
    }

    @Transactional
    public CommentDto addComment(Long issueId, Long authorId, CreateCommentRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND));

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        Comment comment = new Comment(issue, author, request.content().trim());
        Comment saved = commentRepository.save(comment);

        return commentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsByIssue(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }
        return commentRepository.findAllByIssueIdWithAuthor(issueId).stream()
                .map(commentMapper::toDto)
                .toList();
    }

    @Transactional
    public CommentDto updateComment(Long commentId, Long userId, CreateCommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.COMMENT_NOT_FOUND));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ApiException("You are not allowed to edit this comment", HttpStatus.FORBIDDEN);
        }

        comment.setContent(request.content().trim());
        Comment updated = commentRepository.save(comment);

        return commentMapper.toDto(updated);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.COMMENT_NOT_FOUND));

        if (!comment.getAuthor().getId().equals(userId) && !isAdmin) {
            throw new ApiException("You are not allowed to delete this comment", HttpStatus.FORBIDDEN);
        }

        commentRepository.delete(comment);
    }
}

