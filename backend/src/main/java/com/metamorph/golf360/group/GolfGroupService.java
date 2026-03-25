package com.metamorph.golf360.group;

import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GolfGroupService {

    private final GolfGroupRepository golfGroupRepository;
    private final GolfGroupMemberRepository golfGroupMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GolfGroupDtos.GroupResponse> getMyGroups(String userEmail) {
        User user = getUserByEmail(userEmail);
        return golfGroupMemberRepository.findByUserId(user.getId()).stream()
                .map(GolfGroupMember::getGroup)
                .distinct()
                .sorted(Comparator.comparing(GolfGroup::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toGroupResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GolfGroupDtos.GroupResponse getGroup(UUID groupId, String userEmail) {
        User user = getUserByEmail(userEmail);
        ensureMembership(groupId, user.getId());
        GolfGroup group = golfGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));
        return toGroupResponse(group);
    }

    @Transactional
    public GolfGroupDtos.GroupResponse createGroup(GolfGroupDtos.CreateGroupRequest request, String userEmail) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Group name is required");
        }

        User creator = getUserByEmail(userEmail);

        GolfGroup group = new GolfGroup();
        group.setName(request.getName().trim());
        group.setDescription(blankToNull(request.getDescription()));
        group.setScheduleLabel(blankToNull(request.getScheduleLabel()));
        group.setHomeCourseName(blankToNull(request.getHomeCourseName()));
        group.setCreatedBy(creator);
        GolfGroup savedGroup = golfGroupRepository.save(group);

        GolfGroupMember ownerMembership = new GolfGroupMember();
        ownerMembership.setGroup(savedGroup);
        ownerMembership.setUser(creator);
        ownerMembership.setRole(GroupMemberRole.OWNER);
        golfGroupMemberRepository.save(ownerMembership);

        return toGroupResponse(savedGroup);
    }

    @Transactional
    public GolfGroupDtos.GroupResponse addMember(UUID groupId, GolfGroupDtos.AddMemberRequest request, String userEmail) {
        User requester = getUserByEmail(userEmail);
        ensureMembership(groupId, requester.getId());

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Member email is required");
        }

        User member = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new EntityNotFoundException("User not found for the provided email"));

        if (golfGroupMemberRepository.existsByGroupIdAndUserId(groupId, member.getId())) {
            throw new IllegalArgumentException("User is already a member of this group");
        }

        GolfGroup group = golfGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));

        GolfGroupMember membership = new GolfGroupMember();
        membership.setGroup(group);
        membership.setUser(member);
        membership.setRole(GroupMemberRole.MEMBER);
        golfGroupMemberRepository.save(membership);

        return toGroupResponse(group);
    }

    private void ensureMembership(UUID groupId, UUID userId) {
        if (!golfGroupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("You are not a member of this group");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private GolfGroupDtos.GroupResponse toGroupResponse(GolfGroup group) {
        List<GolfGroupDtos.GroupMemberResponse> members = golfGroupMemberRepository.findByGroupIdOrderByCreatedAtAsc(group.getId())
                .stream()
                .map(member -> GolfGroupDtos.GroupMemberResponse.builder()
                        .userId(member.getUser().getId())
                        .fullName(member.getUser().getFullName())
                        .email(member.getUser().getEmail())
                        .role(member.getRole())
                        .handicap(member.getUser().getHandicap())
                        .build())
                .toList();

        return GolfGroupDtos.GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .scheduleLabel(group.getScheduleLabel())
                .homeCourseName(group.getHomeCourseName())
                .createdByUserId(group.getCreatedBy().getId())
                .createdByName(group.getCreatedBy().getFullName())
                .memberCount(members.size())
                .members(members)
                .build();
    }
}
