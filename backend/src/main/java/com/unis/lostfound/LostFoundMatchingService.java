package com.unis.lostfound;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class LostFoundMatchingService {

    private final LostFoundItemRepository itemRepository;

    public LostFoundMatchingService(LostFoundItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public static class MatchCandidate {
        private Long candidateId;
        private String title;
        private String category;
        private String color;
        private String itemType;
        private String locationName;
        private String dateOccurred;
        private int matchScore; // 0 - 100
        private String explanation;

        public MatchCandidate() {
        }

        public MatchCandidate(Long candidateId, String title, String category, String color, String itemType,
                              String locationName, String dateOccurred, int matchScore, String explanation) {
            this.candidateId = candidateId;
            this.title = title;
            this.category = category;
            this.color = color;
            this.itemType = itemType;
            this.locationName = locationName;
            this.dateOccurred = dateOccurred;
            this.matchScore = matchScore;
            this.explanation = explanation;
        }

        public Long getCandidateId() {
            return candidateId;
        }

        public String getTitle() {
            return title;
        }

        public String getCategory() {
            return category;
        }

        public String getColor() {
            return color;
        }

        public String getItemType() {
            return itemType;
        }

        public String getLocationName() {
            return locationName;
        }

        public String getDateOccurred() {
            return dateOccurred;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public String getExplanation() {
            return explanation;
        }
    }

    @Transactional(readOnly = true)
    public List<MatchCandidate> findPossibleMatches(Long itemId) {
        LostFoundItem item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return Collections.emptyList();

        String targetType = "LOST".equalsIgnoreCase(item.getItemType()) ? "FOUND" : "LOST";
        List<LostFoundItem> candidates = itemRepository.findByItemTypeAndStatus(targetType, "OPEN");

        List<MatchCandidate> results = new ArrayList<>();
        Set<String> itemTokens = tokenize(item.getTitle() + " " + item.getDescription());

        for (LostFoundItem candidate : candidates) {
            int score = 0;
            List<String> matchReasons = new ArrayList<>();

            // 1. Category match (30%)
            if (candidate.getCategory() != null && candidate.getCategory().equalsIgnoreCase(item.getCategory())) {
                score += 30;
                matchReasons.add("matching category (" + candidate.getCategory() + ")");
            }

            // 2. Color match (20%)
            if (candidate.getColor() != null && item.getColor() != null &&
                candidate.getColor().equalsIgnoreCase(item.getColor())) {
                score += 20;
                matchReasons.add("matching color (" + candidate.getColor() + ")");
            }

            // 3. Keyword overlap (up to 25%)
            Set<String> candTokens = tokenize(candidate.getTitle() + " " + candidate.getDescription());
            int sharedCount = 0;
            List<String> sharedKeywords = new ArrayList<>();
            for (String tok : itemTokens) {
                if (candTokens.contains(tok)) {
                    sharedCount++;
                    sharedKeywords.add(tok);
                }
            }

            if (sharedCount >= 3) {
                score += 25;
                matchReasons.add("key descriptors [" + String.join(", ", sharedKeywords.subList(0, Math.min(3, sharedKeywords.size()))) + "]");
            } else if (sharedCount >= 1) {
                score += 15;
                matchReasons.add("descriptor [" + sharedKeywords.get(0) + "]");
            }

            // 4. Location match (15%)
            if (candidate.getLocation() != null && item.getLocation() != null &&
                candidate.getLocation().getId().equals(item.getLocation().getId())) {
                score += 15;
                matchReasons.add("same campus location (" + candidate.getLocation().getName() + ")");
            }

            // 5. Date proximity (10%)
            if (candidate.getDateOccurred() != null && item.getDateOccurred() != null) {
                long daysDiff = Math.abs(ChronoUnit.DAYS.between(item.getDateOccurred(), candidate.getDateOccurred()));
                if (daysDiff <= 3) {
                    score += 10;
                    matchReasons.add("within " + daysDiff + " day(s) of reported date");
                }
            }

            if (score >= 45) {
                String locName = candidate.getLocation() != null ? candidate.getLocation().getName() : candidate.getLocationDescription();
                String explanation = "Potential match identified based on " + String.join(", ", matchReasons) + ".";

                results.add(new MatchCandidate(
                        candidate.getId(),
                        candidate.getTitle(),
                        candidate.getCategory(),
                        candidate.getColor(),
                        candidate.getItemType(),
                        locName != null ? locName : "Campus",
                        candidate.getDateOccurred() != null ? candidate.getDateOccurred().toString() : "",
                        score,
                        explanation
                ));
            }
        }

        results.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        String[] words = text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        Set<String> stopWords = Set.of("the", "is", "at", "which", "on", "in", "a", "an", "and", "or", "to", "for", "of", "with", "from", "left", "found");
        Set<String> tokens = new HashSet<>();
        for (String w : words) {
            if (w.length() > 2 && !stopWords.contains(w)) {
                tokens.add(w);
            }
        }
        return tokens;
    }
}
