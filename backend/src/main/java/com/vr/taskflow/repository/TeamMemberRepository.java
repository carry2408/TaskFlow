package com.vr.taskflow.repository;

import com.vr.taskflow.entity.TeamMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    void deleteByTeamIdAndUserId(Long teamId, Long userId);

    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.user WHERE tm.team.id = :teamId")
    List<TeamMember> findAllByTeamIdWithUser(@Param("teamId") Long teamId);

    Page<TeamMember> findByTeamId(Long teamId, Pageable pageable);
}

