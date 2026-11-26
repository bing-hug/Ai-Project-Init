package com.aiproject.init.service.health;

import com.aiproject.init.contract.common.ApiResponse;
import com.aiproject.init.contract.health.IHealthFacade;
import com.aiproject.init.contract.health.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final IHealthFacade healthFacade;

    public HealthController(IHealthFacade healthFacade) {
        this.healthFacade = healthFacade;
    }

    @GetMapping
    public ApiResponse<HealthResponse> health() {
        return ApiResponse.ok(healthFacade.health());
    }
}
