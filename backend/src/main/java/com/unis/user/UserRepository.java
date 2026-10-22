package com.unis.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);

    List<User> findByRole(Role role);
    List<User> findByRoleAndActiveTrue(Role role);
    long countByRoleAndActiveTrue(Role role);
    Optional<User> findFirstByRoleAndFounderTrue(Role role);
    List<User> findByDepartmentIdAndRole(Long departmentId, Role role);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:departmentId IS NULL OR u.department.id = :departmentId) AND " +
           "(:approvalStatus IS NULL OR u.approvalStatus = :approvalStatus) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("role") Role role,
                           @Param("departmentId") Long departmentId,
                           @Param("approvalStatus") ApprovalStatus approvalStatus,
                           @Param("search") String search,
                           Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "u.role = com.unis.user.Role.STUDENT AND " +
           "(:approvalStatus IS NULL OR u.approvalStatus = :approvalStatus) AND " +
           "(:departmentId IS NULL OR u.department.id = :departmentId) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchStudents(@Param("departmentId") Long departmentId,
                              @Param("approvalStatus") ApprovalStatus approvalStatus,
                              @Param("search") String search,
                              Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "u.role = com.unis.user.Role.STUDENT AND u.approvalStatus = com.unis.user.ApprovalStatus.PENDING AND " +
           "(:departmentId IS NULL OR u.department.id = :departmentId OR " +
           "(:deptName IS NOT NULL AND u.departmentRequested IS NOT NULL AND LOWER(u.departmentRequested) = LOWER(:deptName)))")
    List<User> findPendingStudentsForDepartment(@Param("departmentId") Long departmentId,
                                               @Param("deptName") String deptName);
}
