package com.vr.taskflow.controller;

import com.vr.taskflow.constants.AppConstants;
import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.dto.team.CreateTeamRequest;
import com.vr.taskflow.dto.team.TeamDto;
import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "Team and membership management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create a new team (Admin or Project Manager)")
    public ResponseEntity<ApiResponse<TeamDto>> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        TeamDto created = teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Team created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get team details by ID")
    public ResponseEntity<ApiResponse<TeamDto>> getTeamById(@PathVariable Long id) {
        TeamDto team = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @GetMapping
    @Operation(summary = "Get all teams (paginated)")
    public ResponseEntity<ApiResponse<Page<TeamDto>>> getAllTeams(
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<TeamDto> teams = teamService.getAllTeams(pageable);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update team details (Admin or Project Manager)")
    public ResponseEntity<ApiResponse<TeamDto>> updateTeam(@PathVariable Long id,
                                                           @Valid @RequestBody CreateTeamRequest request) {
        TeamDto updated = teamService.updateTeam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Team updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete team (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully"));
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Add member to team")
    public ResponseEntity<ApiResponse<Void>> addMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.addMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("User added to team successfully"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Remove member from team")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("User removed from team successfully"));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "List all members of a team")
    public ResponseEntity<ApiResponse<List<UserDto>>> getTeamMembers(@PathVariable Long id) {
        List<UserDto> members = teamService.getTeamMembers(id);
        return ResponseEntity.ok(ApiResponse.success(members));
    }
}

