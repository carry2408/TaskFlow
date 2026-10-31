package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.readAt = :now WHERE n.recipient.id = :recipientId AND n.readAt IS NULL")
    void markAllAsRead(@Param("recipientId") Long recipientId, @Param("now") LocalDateTime now);
}

