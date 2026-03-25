package com.metamorph.golf360.group;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3005")
public class GolfGroupController {

    private final GolfGroupService golfGroupService;

    @GetMapping("/my")
    public List<GolfGroupDtos.GroupResponse> getMyGroups(Authentication authentication) {
        return golfGroupService.getMyGroups(authentication.getName());
    }

    @GetMapping("/{groupId}")
    public GolfGroupDtos.GroupResponse getGroup(@PathVariable UUID groupId, Authentication authentication) {
        return golfGroupService.getGroup(groupId, authentication.getName());
    }

    @PostMapping
    public GolfGroupDtos.GroupResponse createGroup(@RequestBody GolfGroupDtos.CreateGroupRequest request,
                                                   Authentication authentication) {
        return golfGroupService.createGroup(request, authentication.getName());
    }

    @PostMapping("/{groupId}/members")
    public GolfGroupDtos.GroupResponse addMember(@PathVariable UUID groupId,
                                                 @RequestBody GolfGroupDtos.AddMemberRequest request,
                                                 Authentication authentication) {
        return golfGroupService.addMember(groupId, request, authentication.getName());
    }
}
