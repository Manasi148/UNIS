package com.unis.announcement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementBookmarkRepository extends JpaRepository<AnnouncementBookmark, Long> {
    Optional<AnnouncementBookmark> findByAnnouncementIdAndUserId(Long announcementId, Long userId);
    boolean existsByAnnouncementIdAndUserId(Long announcementId, Long userId);
    void deleteByAnnouncementIdAndUserId(Long announcementId, Long userId);

    @Query("SELECT b.announcement FROM AnnouncementBookmark b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Announcement> findBookmarkedAnnouncementsByUser(@Param("userId") Long userId);
}
