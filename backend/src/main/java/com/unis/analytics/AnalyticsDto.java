package com.unis.analytics;

import java.util.List;
import java.util.Map;

public class AnalyticsDto {

    public static class OverviewStats {
        private long totalTickets;
        private long openTickets;
        private long inProgressTickets;
        private long resolvedTickets;
        private long closedTickets;
        private long overdueTickets;
        private double averageResolutionHours;
        private double slaComplianceRate; // percentage
        private long totalUsers;
        private long totalDepartments;
        private long lostFoundItemsCount;

        public OverviewStats() {
        }

        public long getTotalTickets() { return totalTickets; }
        public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }

        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }

        public long getInProgressTickets() { return inProgressTickets; }
        public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }

        public long getResolvedTickets() { return resolvedTickets; }
        public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }

        public long getClosedTickets() { return closedTickets; }
        public void setClosedTickets(long closedTickets) { this.closedTickets = closedTickets; }

        public long getOverdueTickets() { return overdueTickets; }
        public void setOverdueTickets(long overdueTickets) { this.overdueTickets = overdueTickets; }

        public double getAverageResolutionHours() { return averageResolutionHours; }
        public void setAverageResolutionHours(double averageResolutionHours) { this.averageResolutionHours = averageResolutionHours; }

        public double getSlaComplianceRate() { return slaComplianceRate; }
        public void setSlaComplianceRate(double slaComplianceRate) { this.slaComplianceRate = slaComplianceRate; }

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getTotalDepartments() { return totalDepartments; }
        public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

        public long getLostFoundItemsCount() { return lostFoundItemsCount; }
        public void setLostFoundItemsCount(long lostFoundItemsCount) { this.lostFoundItemsCount = lostFoundItemsCount; }
    }

    public static class ChartDataPoint {
        private String label;
        private long value;
        private String extra;

        public ChartDataPoint() {
        }

        public ChartDataPoint(String label, long value) {
            this.label = label;
            this.value = value;
        }

        public ChartDataPoint(String label, long value, String extra) {
            this.label = label;
            this.value = value;
            this.extra = extra;
        }

        public String getLabel() { return label; }
        public long getValue() { return value; }
        public String getExtra() { return extra; }
    }

    public static class StaffWorkload {
        private Long staffId;
        private String staffName;
        private String departmentName;
        private long assignedCount;
        private long inProgressCount;
        private long resolvedCount;

        public StaffWorkload() {
        }

        public StaffWorkload(Long staffId, String staffName, String departmentName,
                             long assignedCount, long inProgressCount, long resolvedCount) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.departmentName = departmentName;
            this.assignedCount = assignedCount;
            this.inProgressCount = inProgressCount;
            this.resolvedCount = resolvedCount;
        }

        public Long getStaffId() { return staffId; }
        public String getStaffName() { return staffName; }
        public String getDepartmentName() { return departmentName; }
        public long getAssignedCount() { return assignedCount; }
        public long getInProgressCount() { return inProgressCount; }
        public long getResolvedCount() { return resolvedCount; }
    }

    public static class HotspotDto {
        private Long locationId;
        private String building;
        private String roomNumber;
        private String locationName;
        private long complaintCount;
        private long overdueCount;
        private String topCategory;
        private String severity; // HIGH, MEDIUM, LOW
        private String explanation;

        public HotspotDto() {
        }

        public HotspotDto(Long locationId, String building, String roomNumber, String locationName,
                          long complaintCount, long overdueCount, String topCategory,
                          String severity, String explanation) {
            this.locationId = locationId;
            this.building = building;
            this.roomNumber = roomNumber;
            this.locationName = locationName;
            this.complaintCount = complaintCount;
            this.overdueCount = overdueCount;
            this.topCategory = topCategory;
            this.severity = severity;
            this.explanation = explanation;
        }

        public Long getLocationId() { return locationId; }
        public String getBuilding() { return building; }
        public String getRoomNumber() { return roomNumber; }
        public String getLocationName() { return locationName; }
        public long getComplaintCount() { return complaintCount; }
        public long getOverdueCount() { return overdueCount; }
        public String getTopCategory() { return topCategory; }
        public String getSeverity() { return severity; }
        public String getExplanation() { return explanation; }
    }
}
