package com.vr.taskflow.specification;

import com.vr.taskflow.dto.issue.IssueFilterRequest;
import com.vr.taskflow.entity.Issue;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class IssueSpecification {

    public static Specification<Issue> filter(IssueFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.query() != null && !filter.query().isBlank()) {
                String pattern = "%" + filter.query().trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, descLike));
            }

            if (filter.projectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), filter.projectId()));
            }

            if (filter.assigneeId() != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), filter.assigneeId()));
            }

            if (filter.reporterId() != null) {
                predicates.add(cb.equal(root.get("reporter").get("id"), filter.reporterId()));
            }

            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }

            if (filter.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.priority()));
            }

            if (filter.issueType() != null) {
                predicates.add(cb.equal(root.get("issueType"), filter.issueType()));
            }

            if (filter.dueDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), filter.dueDateFrom()));
            }

            if (filter.dueDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), filter.dueDateTo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

