package com.aiproject.init.contract.health;

/**
 * 健康检查响应。
 *
 * @param status    服务状态，正常启动为 UP
 * @param service   服务名，取自 spring.application.name
 * @param timestamp 服务端毫秒时间戳
 */
public record HealthResponse(String status, String service, long timestamp) {
}
