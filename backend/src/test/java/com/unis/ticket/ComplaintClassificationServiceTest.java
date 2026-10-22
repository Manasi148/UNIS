package com.unis.ticket;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ComplaintClassificationServiceTest {

    private ComplaintClassificationService classificationService;

    @BeforeEach
    void setUp() {
        classificationService = new ComplaintClassificationService();
    }

    @Test
    @DisplayName("Should classify Wi-Fi complaint to Wi-Fi & Networking category and IT Support")
    void testClassifyWifiComplaint() {
        ComplaintClassificationService.ClassificationResult result = classificationService.classifyComplaint(
                "Cannot connect to student Wi-Fi in Central Library",
                "Wi-Fi network signal repeatedly drops and ethernet router authentication fails.",
                "Central Library"
        );

        assertNotNull(result);
        assertEquals("Wi-Fi & Networking", result.getSuggestedCategory());
        assertEquals("ITS", result.getSuggestedDepartmentCode());
        assertEquals("IT Support & Networking", result.getSuggestedDepartmentName());
        assertTrue(result.getConfidenceScore() >= 70);
        assertTrue(result.getExplanation().contains("wi-fi") || result.getExplanation().contains("router"));
    }

    @Test
    @DisplayName("Should classify Projector / Laboratory complaint to Laboratory Equipment")
    void testClassifyLabProjectorComplaint() {
        ComplaintClassificationService.ClassificationResult result = classificationService.classifyComplaint(
                "Overhead projector bulb exploded in Computing Lab 2",
                "Projector display is black and error LED blinking continuously on workstation.",
                "Computing Block"
        );

        assertNotNull(result);
        assertEquals("Laboratory Equipment", result.getSuggestedCategory());
        assertEquals("LAB", result.getSuggestedDepartmentCode());
        assertEquals("Laboratory Maintenance", result.getSuggestedDepartmentName());
        assertTrue(result.getConfidenceScore() >= 70);
    }

    @Test
    @DisplayName("Should elevate priority when critical safety keywords detected")
    void testUrgentKeywordPriorityElevation() {
        ComplaintClassificationService.ClassificationResult result = classificationService.classifyComplaint(
                "Emergency electrical fire spark in Main Academic Block",
                "Short circuit sparking near breaker box with severe smoke.",
                "Academic Block A"
        );

        assertNotNull(result);
        assertEquals(TicketPriority.CRITICAL, result.getSuggestedPriority());
        assertTrue(result.getHandlingInstructions().contains("URGENT SAFETY ALERT"));
    }
}
