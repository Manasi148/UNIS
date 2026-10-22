package com.unis.ticket;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComplaintClassificationService {

    public static class ClassificationResult {
        private String suggestedCategory;
        private String suggestedDepartmentCode;
        private String suggestedDepartmentName;
        private TicketPriority suggestedPriority;
        private int confidenceScore; // 0 - 100
        private String explanation;
        private List<String> matchedKeywords;
        private String handlingInstructions;

        public ClassificationResult() {
        }

        public ClassificationResult(String suggestedCategory, String suggestedDepartmentCode,
                                    String suggestedDepartmentName, TicketPriority suggestedPriority,
                                    int confidenceScore, String explanation,
                                    List<String> matchedKeywords, String handlingInstructions) {
            this.suggestedCategory = suggestedCategory;
            this.suggestedDepartmentCode = suggestedDepartmentCode;
            this.suggestedDepartmentName = suggestedDepartmentName;
            this.suggestedPriority = suggestedPriority;
            this.confidenceScore = confidenceScore;
            this.explanation = explanation;
            this.matchedKeywords = matchedKeywords;
            this.handlingInstructions = handlingInstructions;
        }

        public String getSuggestedCategory() {
            return suggestedCategory;
        }

        public String getSuggestedDepartmentCode() {
            return suggestedDepartmentCode;
        }

        public String getSuggestedDepartmentName() {
            return suggestedDepartmentName;
        }

        public TicketPriority getSuggestedPriority() {
            return suggestedPriority;
        }

        public int getConfidenceScore() {
            return confidenceScore;
        }

        public String getExplanation() {
            return explanation;
        }

        public List<String> getMatchedKeywords() {
            return matchedKeywords;
        }

        public String getHandlingInstructions() {
            return handlingInstructions;
        }
    }

    // Keyword rule definitions
    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new LinkedHashMap<>();
    private static final Map<String, String> CATEGORY_TO_DEPT_CODE = new HashMap<>();
    private static final Map<String, String> CATEGORY_TO_DEPT_NAME = new HashMap<>();

    static {
        CATEGORY_KEYWORDS.put("Wi-Fi & Networking", List.of(
                "wifi", "wi-fi", "internet", "network", "ethernet", "router", "hotspot", "dns", "lan", "connection drop", "signal"
        ));
        CATEGORY_KEYWORDS.put("Laboratory Equipment", List.of(
                "projector", "screen", "workstation", "oscilloscope", "pc", "computer", "keyboard", "monitor", "workbench", "microscope", "hdmi", "lab equipment"
        ));
        CATEGORY_KEYWORDS.put("Electricity", List.of(
                "light", "bulb", "fan", "power", "switch", "socket", "short circuit", "spark", "ac", "air conditioner", "heating", "breaker", "blackout"
        ));
        CATEGORY_KEYWORDS.put("Plumbing", List.of(
                "leak", "water", "pipe", "cooler", "tap", "sink", "drain", "toilet", "flush", "overflow", "basin"
        ));
        CATEGORY_KEYWORDS.put("Cleanliness", List.of(
                "trash", "dustbin", "clean", "dirty", "garbage", "spill", "smell", "sanitise", "hygiene", "litter"
        ));
        CATEGORY_KEYWORDS.put("Furniture & Facilities", List.of(
                "chair", "desk", "bench", "door", "window", "lock", "whiteboard", "blackboard", "podium", "table", "hinge"
        ));
        CATEGORY_KEYWORDS.put("Security & Safety", List.of(
                "alarm", "cctv", "camera", "theft", "stolen", "hazard", "slip", "unauthorized", "emergency", "fire", "extinguisher"
        ));

        // Mapping to department codes & names
        CATEGORY_TO_DEPT_CODE.put("Wi-Fi & Networking", "ITS");
        CATEGORY_TO_DEPT_NAME.put("Wi-Fi & Networking", "IT Support & Networking");
        CATEGORY_TO_DEPT_CODE.put("Laboratory Equipment", "LAB");
        CATEGORY_TO_DEPT_NAME.put("Laboratory Equipment", "Laboratory Maintenance");

        CATEGORY_TO_DEPT_CODE.put("Electricity", "FAC");
        CATEGORY_TO_DEPT_NAME.put("Electricity", "Facilities & Maintenance");

        CATEGORY_TO_DEPT_CODE.put("Plumbing", "FAC");
        CATEGORY_TO_DEPT_NAME.put("Plumbing", "Facilities & Maintenance");

        CATEGORY_TO_DEPT_CODE.put("Cleanliness", "HKP");
        CATEGORY_TO_DEPT_NAME.put("Cleanliness", "Housekeeping & Sanitation");

        CATEGORY_TO_DEPT_CODE.put("Furniture & Facilities", "FAC");
        CATEGORY_TO_DEPT_NAME.put("Furniture & Facilities", "Facilities & Maintenance");

        CATEGORY_TO_DEPT_CODE.put("Security & Safety", "SEC");
        CATEGORY_TO_DEPT_NAME.put("Security & Safety", "Campus Safety & Security");
    }

    private static final List<String> CRITICAL_KEYWORDS = List.of(
            "spark", "fire", "smoke", "flood", "short circuit", "emergency", "hazard", "severe leak", "blackout"
    );

    private static final List<String> HIGH_KEYWORDS = List.of(
            "not working", "broken", "flicker", "urgent", "exam", "guest lecture", "auditorium", "leakage", "slip"
    );

    public ClassificationResult classifyComplaint(String title, String description, String locationName) {
        String combined = ((title != null ? title : "") + " " +
                           (description != null ? description : "") + " " +
                           (locationName != null ? locationName : "")).toLowerCase();

        String bestCategory = "Other";
        int maxMatches = 0;
        List<String> matchedKeywords = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int count = 0;
            List<String> currentMatched = new ArrayList<>();
            for (String kw : entry.getValue()) {
                if (combined.contains(kw)) {
                    count++;
                    currentMatched.add(kw);
                }
            }
            if (count > maxMatches) {
                maxMatches = count;
                bestCategory = entry.getKey();
                matchedKeywords = currentMatched;
            }
        }

        // Determine Priority heuristic
        TicketPriority priority = TicketPriority.MEDIUM;
        for (String kw : CRITICAL_KEYWORDS) {
            if (combined.contains(kw)) {
                priority = TicketPriority.CRITICAL;
                break;
            }
        }
        if (priority == TicketPriority.MEDIUM) {
            for (String kw : HIGH_KEYWORDS) {
                if (combined.contains(kw)) {
                    priority = TicketPriority.HIGH;
                    break;
                }
            }
        }

        // Calculate confidence score
        int confidence = 50;
        if (maxMatches >= 3) {
            confidence = 95;
        } else if (maxMatches == 2) {
            confidence = 85;
        } else if (maxMatches == 1) {
            confidence = 72;
        }

        String deptCode = CATEGORY_TO_DEPT_CODE.getOrDefault(bestCategory, "FAC");
        String deptName = CATEGORY_TO_DEPT_NAME.getOrDefault(bestCategory, "Facilities & Maintenance");

        String explanation;
        if (!matchedKeywords.isEmpty()) {
            explanation = "Recommended based on matched institutional keywords: [" +
                    String.join(", ", matchedKeywords) + "] in report description.";
        } else {
            explanation = "General classification applied based on default facilities routing.";
        }

        String instructions = "Standard departmental ticket assignment protocol for " + deptName + ".";
        if (priority == TicketPriority.CRITICAL) {
            instructions = "URGENT SAFETY ALERT: Requires rapid dispatch within 1 hour.";
        }

        return new ClassificationResult(
                bestCategory,
                deptCode,
                deptName,
                priority,
                confidence,
                explanation,
                matchedKeywords,
                instructions
        );
    }
}
