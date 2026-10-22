package com.unis.ticket;

import com.unis.location.CampusLocation;
import com.unis.user.Role;
import com.unis.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DuplicateDetectionServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    @Test
    @DisplayName("Should detect high similarity score for duplicate projector complaint in same room")
    void testDetectDuplicateProjectorComplaint() {
        User student = new User();
        student.setId(10L);
        student.setFullName("Maya Patel");
        student.setRole(Role.STUDENT);

        CampusLocation location = new CampusLocation();
        location.setId(5L);
        location.setBuilding("Computing Block");
        location.setRoomNumber("Lab 2");
        location.setName("Computing Block - Lab 2");

        Ticket existingTicket = new Ticket();
        existingTicket.setId(100L);
        existingTicket.setTicketReference("TKT-20261010-0001");
        existingTicket.setCreatedBy(student);
        existingTicket.setCategory("Laboratory Equipment");
        existingTicket.setTitle("Projector not working in Computing Lab 2");
        existingTicket.setDescription("Overhead projector display broken and cannot turn on");
        existingTicket.setLocation(location);
        existingTicket.setStatus(TicketStatus.IN_PROGRESS);

        when(ticketRepository.findByStatusNot(TicketStatus.CLOSED)).thenReturn(List.of(existingTicket));

        List<DuplicateDetectionService.DuplicateMatch> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "Laboratory Equipment",
                5L,
                "Broken projector display in Computing Lab 2",
                "Projector bulb does not light up"
        );

        assertNotNull(duplicates);
        assertFalse(duplicates.isEmpty());
        DuplicateDetectionService.DuplicateMatch match = duplicates.get(0);
        assertEquals("TKT-20261010-0001", match.getTicketReference());
        assertTrue(match.getSimilarityScore() >= 60, "Expected similarity score >= 60% but got: " + match.getSimilarityScore());
    }

    @Test
    @DisplayName("Should return empty list when no similar complaints exist in different locations")
    void testNoDuplicateForUnrelatedLocation() {
        CampusLocation location = new CampusLocation();
        location.setId(12L);
        location.setBuilding("Student Center");
        location.setRoomNumber("Dining Hall");
        location.setName("Student Center - Dining Hall");

        Ticket existingTicket = new Ticket();
        existingTicket.setId(101L);
        existingTicket.setTicketReference("TKT-20261010-0002");
        existingTicket.setCategory("Cleanliness");
        existingTicket.setTitle("Spill in Cafeteria");
        existingTicket.setDescription("Coffee spill on floor");
        existingTicket.setLocation(location);
        existingTicket.setStatus(TicketStatus.SUBMITTED);

        when(ticketRepository.findByStatusNot(TicketStatus.CLOSED)).thenReturn(List.of(existingTicket));

        List<DuplicateDetectionService.DuplicateMatch> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "Wi-Fi & Networking",
                99L,
                "Wi-Fi down in Library",
                "Cannot reach authentication gateway"
        );

        assertNotNull(duplicates);
        assertTrue(duplicates.isEmpty());
    }
}
