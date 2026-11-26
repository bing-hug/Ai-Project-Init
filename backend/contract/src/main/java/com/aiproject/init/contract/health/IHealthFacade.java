package com.aiproject.init.contract.health;

/**
 * 健康检查契约。实现放在 service 模块，Controller 只依赖这个接口。
 */
public interface IHealthFacade {

    HealthResponse health();
}
