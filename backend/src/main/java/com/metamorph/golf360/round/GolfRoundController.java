package com.metamorph.golf360.round;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3005")
public class GolfRoundController {

    private final GolfRoundService golfRoundService;

    @GetMapping("/my")
    public List<RoundDtos.RoundSummaryResponse> getMyRounds(Authentication authentication) {
        return golfRoundService.getMyRounds(authentication.getName());
    }

    @GetMapping("/{roundId}")
    public RoundDtos.RoundDetailResponse getRound(@PathVariable UUID roundId, Authentication authentication) {
        return golfRoundService.getRound(roundId, authentication.getName());
    }

    @PostMapping
    public RoundDtos.RoundDetailResponse createRound(@RequestBody RoundDtos.CreateRoundRequest request,
            Authentication authentication) {
        return golfRoundService.createRound(request, authentication.getName());
    }

    @PostMapping("/{roundId}/scores")
    public RoundDtos.RoundDetailResponse submitScores(@PathVariable UUID roundId,
            @RequestBody RoundDtos.SubmitScoresRequest request,
            Authentication authentication) {
        return golfRoundService.submitScores(roundId, request, authentication.getName());
    }

    @PatchMapping("/{roundId}/complete")
    public RoundDtos.RoundDetailResponse completeRound(@PathVariable UUID roundId,
            Authentication authentication) {
        return golfRoundService.completeRound(roundId, authentication.getName());
    }
}