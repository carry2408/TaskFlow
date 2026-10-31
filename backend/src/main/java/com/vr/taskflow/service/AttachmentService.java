package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.attachment.AttachmentDto;
import com.vr.taskflow.entity.Attachment;
import com.vr.taskflow.entity.Comment;
import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.UserMapper;
import com.vr.taskflow.repository.AttachmentRepository;
import com.vr.taskflow.repository.CommentRepository;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

    private static final String UPLOAD_DIR = "uploads";

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             IssueRepository issueRepository,
                             CommentRepository commentRepository,
                             UserRepository userRepository,
                             UserMapper userMapper) {
        this.attachmentRepository = attachmentRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.userMapper = userMapper;

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long issueId, Long commentId, Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("File is empty", HttpStatus.BAD_REQUEST);
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        Comment comment = null;
        if (commentId != null) {
            comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.COMMENT_NOT_FOUND));
        }

        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String storedFileName = UUID.randomUUID() + "_" + originalFileName.replaceAll("\\s+", "_");
        Path destination = Paths.get(UPLOAD_DIR).resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException("Failed to store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Attachment attachment = new Attachment(
                issue,
                comment,
                user,
                storedFileName,
                originalFileName,
                destination.toString(),
                file.getSize(),
                file.getContentType()
        );

        Attachment saved = attachmentRepository.save(attachment);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsForIssue(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }
        return attachmentRepository.findAllByIssueIdWithUser(issueId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        try {
            Path filePath = Paths.get(attachment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ApiException("File not found or unreadable", HttpStatus.NOT_FOUND);
            }
        } catch (MalformedURLException e) {
            throw new ApiException("File path error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentMetadata(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    }

    private AttachmentDto mapToDto(Attachment a) {
        return new AttachmentDto(
                a.getId(),
                a.getIssue().getId(),
                a.getComment() != null ? a.getComment().getId() : null,
                userMapper.toDto(a.getUploadedBy()),
                a.getFileName(),
                a.getOriginalFileName(),
                a.getFileSize(),
                a.getMimeType(),
                a.getCreatedAt()
        );
    }
}

