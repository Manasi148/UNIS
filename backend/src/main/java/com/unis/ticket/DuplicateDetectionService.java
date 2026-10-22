package com.unis.ticket;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DuplicateDetectionService {

    private final TicketRepository ticketRepository;

    public DuplicateDetectionService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public static class DuplicateMatch {
        private Long ticketId;
        private String ticketReference;
        private String title;
        private String category;
        private String locationName;
        private String status;
        private int similarityScore; // 0 - 100
        private String explanation;

        public DuplicateMatch() {
        }

        public DuplicateMatch(Long ticketId, String ticketReference, String title, String category,
                              String locationName, String status, int similarityScore, String explanation) {
            this.ticketId = ticketId;
            this.ticketReference = ticketReference;
            this.title = title;
            this.category = category;
            this.locationName = locationName;
            this.status = status;
            this.similarityScore = similarityScore;
            this.explanation = explanation;
        }

        public Long getTicketId() {
            return ticketId;
        }

        public String getTicketReference() {
            return ticketReference;
        }

        public String getTitle() {
            return title;
        }

        public String getCategory() {
            return category;
        }

        public String getLocationName() {
            return locationName;
        }

        public String getStatus() {
            return status;
        }

        public int getSimilarityScore() {
            return similarityScore;
        }

        public String getExplanation() {
            return explanation;
        }
    }

    @Transactional(readOnly = true)
    public List<DuplicateMatch> findPotentialDuplicates(String category, Long locationId, String title, String description) {
        // Fetch all unresolved tickets
        List<Ticket> activeTickets = ticketRepository.findByStatusNot(TicketStatus.CLOSED);

        List<DuplicateMatch> matches = new ArrayList<>();
        Set<String> queryTokens = tokenize((title != null ? title : "") + " " + (description != null ? description : ""));

        for (Ticket candidate : activeTickets) {
            // Ignore resolved tickets unless very recent
            if (candidate.getStatus() == TicketStatus.RESOLVED) continue;

            int score = 0;
            List<String> reasons = new ArrayList<>();

            // 1. Category match (35%)
            if (candidate.getCategory() != null && candidate.getCategory().equalsIgnoreCase(category)) {
                score += 35;
                reasons.add("identical category (" + candidate.getCategory() + ")");
            }

            // 2. Location match (40%)
            if (candidate.getLocation() != null && locationId != null &&
                candidate.getLocation().getId().equals(locationId)) {
                score += 40;
                reasons.add("exact campus location (" + candidate.getLocation().getName() + ")");
            }

            // 3. Keyword / text token overlap (up to 25%)
            Set<String> candidateTokens = tokenize(candidate.getTitle() + " " + candidate.getDescription());
            int overlapCount = 0;
            List<String> overlappingKeywords = new ArrayList<>();
            for (String token : queryTokens) {
                if (candidateTokens.contains(token)) {
                    overlapCount++;
                    overlappingKeywords.add(token);
                }
            }

            if (overlapCount >= 3) {
                score += 25;
                reasons.add("multiple matching problem terms [" + String.join(", ", overlappingKeywords.subList(0, Math.min(3, overlappingKeywords.size()))) + "]");
            } else if (overlapCount >= 1) {
                score += 15;
                reasons.add("matching keyword [" + overlappingKeywords.get(0) + "]");
            }

            // If combined similarity is >= 50%, register as duplicate candidate
            if (score >= 50) {
                String locName = candidate.getLocation() != null ? candidate.getLocation().getName() : "Campus";
                String explanation = "High similarity detected due to " + String.join(" and ", reasons) + ".";

                matches.add(new DuplicateMatch(
                        candidate.getId(),
                        candidate.getTicketReference(),
                        candidate.getTitle(),
                        candidate.getCategory(),
                        locName,
                        candidate.getStatus().name(),
                        score,
                        explanation
                ));
            }
        }

        // Sort descending by similarity score
        matches.sort((a, b) -> Integer.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return matches;
    }

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        String[] words = text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        Set<String> stopWords = Set.of("the", "is", "at", "which", "on", "in", "a", "an", "and", "or", "to", "for", "of", "with", "from");
        Set<String> tokens = new HashSet<>();
        for (String w : words) {
            if (w.length() > 2 && !stopWords.contains(w)) {
                tokens.add(w);
            }
        }
        return tokens;
    }
}
