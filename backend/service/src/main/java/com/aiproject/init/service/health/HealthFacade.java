package com.aiproject.init.service.health;

import com.aiproject.init.contract.health.HealthResponse;
import com.aiproject.init.contract.health.IHealthFacade;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HealthFacade implements IHealthFacade {

    private final String serviceName;

    public HealthFacade(@Value("${spring.application.name:fullstack-mall-service}") String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public HealthResponse health() {
        return new HealthResponse("UP", serviceName, System.currentTimeMillis());
    }
}
