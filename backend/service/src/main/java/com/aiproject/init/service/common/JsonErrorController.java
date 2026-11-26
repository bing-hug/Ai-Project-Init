package com.aiproject.init.service.common;

import com.aiproject.init.contract.common.ApiResponse;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 接管 Spring Boot 的 /error，替代默认的 Whitelabel 页面。
 * 浏览器或前端拿到的永远是统一 JSON：{ result: -1, code: <HTTP状态码>, msg: "..." }。
 */
@RestController
public class JsonErrorController implements ErrorController {

    @RequestMapping("${server.error.path:${error.path:/error}}")
    public ResponseEntity<ApiResponse<Void>> handleError(HttpServletRequest request) {
        HttpStatus status = resolveStatus(request);
        return ResponseEntity.status(status)
                .body(ApiResponse.error(status.value(), resolveMessage(status, request)));
    }

    private HttpStatus resolveStatus(HttpServletRequest request) {
        Object attribute = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (attribute instanceof Integer value) {
            HttpStatus resolved = HttpStatus.resolve(value);
            if (resolved != null) {
                return resolved;
            }
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private String resolveMessage(HttpStatus status, HttpServletRequest request) {
        String method = request.getMethod();
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        String path = uri instanceof String value ? value : request.getRequestURI();

        if (status == HttpStatus.NOT_FOUND) {
            return "接口不存在: " + method + " " + path;
        }
        if (status == HttpStatus.METHOD_NOT_ALLOWED) {
            return "请求方法不支持: " + method + " " + path;
        }
        if (status.is5xxServerError()) {
            return "服务器内部错误";
        }
        return status.getReasonPhrase();
    }
}
