package com.aiproject.init.contract.common;

/**
 * 统一响应包装。所有对外接口都返回这个结构，前端只需判断 code。
 *
 * @param code    业务码，成功固定为 SUCCESS
 * @param message 提示信息
 * @param data    业务数据，失败时为 null
 */
public record ApiResponse<T>(String code, String message, T data) {

    public static final String SUCCESS = "SUCCESS";

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(SUCCESS, "ok", data);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(SUCCESS, "ok", null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
