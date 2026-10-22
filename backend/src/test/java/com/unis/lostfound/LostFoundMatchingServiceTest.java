package com.unis.lostfound;

import com.unis.user.Role;
import com.unis.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LostFoundMatchingServiceTest {

    @Mock
    private LostFoundItemRepository lostFoundItemRepository;

    @InjectMocks
    private LostFoundMatchingService matchingService;

    @Test
    @DisplayName("Should detect matching Found calculator for reported Lost calculator")
    void testMatchCalculatorListing() {
        User student = new User();
        student.setId(10L);
        student.setFullName("Maya");
        student.setRole(Role.STUDENT);

        LostFoundItem lostItem = new LostFoundItem();
        lostItem.setId(100L);
        lostItem.setTitle("Lost Casio fx-991EX Scientific Calculator");
        lostItem.setCategory("Electronics");
        lostItem.setDescription("Black Casio scientific calculator left in library reading hall");
        lostItem.setColor("Black");
        lostItem.setLocationDescription("Central Library");
        lostItem.setDateOccurred(LocalDate.now().minusDays(2));
        lostItem.setItemType("LOST");
        lostItem.setStatus("OPEN");
        lostItem.setReportedBy(student);

        LostFoundItem foundItem = new LostFoundItem();
        foundItem.setId(200L);
        foundItem.setTitle("Found Casio Calculator in Library");
        foundItem.setCategory("Electronics");
        foundItem.setDescription("Black scientific calculator picked up near 2nd floor desk");
        foundItem.setColor("Black");
        foundItem.setLocationDescription("Central Library");
        foundItem.setDateOccurred(LocalDate.now().minusDays(1));
        foundItem.setItemType("FOUND");
        foundItem.setStatus("OPEN");
        foundItem.setReportedBy(student);

        when(lostFoundItemRepository.findById(100L)).thenReturn(Optional.of(lostItem));
        when(lostFoundItemRepository.findByItemTypeAndStatus("FOUND", "OPEN"))
                .thenReturn(List.of(foundItem));

        List<LostFoundMatchingService.MatchCandidate> matches = matchingService.findPossibleMatches(100L);

        assertNotNull(matches);
        assertFalse(matches.isEmpty());
        LostFoundMatchingService.MatchCandidate match = matches.get(0);
        assertEquals(200L, match.getCandidateId());
        assertTrue(match.getMatchScore() >= 60, "Expected match score >= 60% but got: " + match.getMatchScore());
        assertTrue(match.getExplanation().contains("matching category"));
    }
}
