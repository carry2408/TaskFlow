package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Sprint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectIdOrderByStartDateDesc(Long projectId);

    Page<Sprint> findByProjectId(Long projectId, Pageable pageable);
}

