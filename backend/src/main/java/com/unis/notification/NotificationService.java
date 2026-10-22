package com.unis.notification;

import com.unis.common.ForbiddenException;
import com.unis.common.PagedResponse;
import com.unis.common.ResourceNotFoundException;
import com.unis.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User recipient, String type, String title, String message, String resourceType, Long resourceId) {
        if (recipient == null) return;
        Notification notif = new Notification(recipient, type, title, message, resourceType, resourceId);
        notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return PagedResponse.of(page.map(NotificationDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notif.getRecipient().getId().equals(userId)) {
            throw new ForbiddenException("Cannot modify notifications belonging to another user");
        }

        notif.setRead(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
}
