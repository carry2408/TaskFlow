package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.label.CreateLabelRequest;
import com.vr.taskflow.dto.label.LabelDto;
import com.vr.taskflow.entity.Label;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.LabelRepository;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LabelService {

    private final LabelRepository labelRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public LabelService(LabelRepository labelRepository,
                        IssueRepository issueRepository,
                        UserRepository userRepository,
                        JdbcTemplate jdbcTemplate) {
        this.labelRepository = labelRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public LabelDto createLabel(Long userId, CreateLabelRequest request) {
        if (labelRepository.existsByName(request.name())) {
            throw new ApiException("Label already exists with this name", HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        Label label = new Label(request.name().trim(), request.color(), user);
        Label saved = labelRepository.save(label);

        return new LabelDto(saved.getId(), saved.getName(), saved.getColor());
    }

    @Transactional(readOnly = true)
    public List<LabelDto> getAllLabels() {
        return labelRepository.findAll().stream()
                .map(l -> new LabelDto(l.getId(), l.getName(), l.getColor()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabelDto> getLabelsForIssue(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }
        return labelRepository.findLabelsByIssueId(issueId).stream()
                .map(l -> new LabelDto(l.getId(), l.getName(), l.getColor()))
                .toList();
    }

    @Transactional
    public void assignLabelToIssue(Long issueId, Long labelId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }
        if (!labelRepository.existsById(labelId)) {
            throw new ResourceNotFoundException("Label not found");
        }

        String checkSql = "SELECT COUNT(*) FROM issue_labels WHERE issue_id = ? AND label_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, issueId, labelId);
        if (count != null && count > 0) {
            return;
        }

        String insertSql = "INSERT INTO issue_labels (issue_id, label_id) VALUES (?, ?)";
        jdbcTemplate.update(insertSql, issueId, labelId);
    }

    @Transactional
    public void removeLabelFromIssue(Long issueId, Long labelId) {
        String deleteSql = "DELETE FROM issue_labels WHERE issue_id = ? AND label_id = ?";
        jdbcTemplate.update(deleteSql, issueId, labelId);
    }
}

