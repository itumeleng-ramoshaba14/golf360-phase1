package com.metamorph.golf360.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3005")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/my")
    public DashboardDtos.DashboardResponse getMyDashboard(Authentication authentication) {
        return dashboardService.getMyDashboard(authentication.getName());
    }
}
