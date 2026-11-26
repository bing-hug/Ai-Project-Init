package com.aiproject.init.contract.common;

/**
 * 统一响应包装。字段与前端 src/request/type.ts 的 ApiResponse 完全一致，
 * 契约以前端为准，后端不再自定义结构。
 *
 * @param result 结果标记：0 成功，-1 失败
 * @param code   业务码：成功固定 0，失败取 HTTP 状态码（400/401/403/404/405/500）
 * @param msg    提示信息，前端可直接展示
 * @param data   业务数据，失败时为 null
 */
public record ApiResponse<T>(int result, int code, String msg, T data) {

    public static final int SUCCESS_RESULT = 0;
    public static final int FAILURE_RESULT = -1;
    public static final int SUCCESS_CODE = 0;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(SUCCESS_RESULT, SUCCESS_CODE, "ok", data);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(SUCCESS_RESULT, SUCCESS_CODE, "ok", null);
    }

    public static <T> ApiResponse<T> error(int code, String msg) {
        return new ApiResponse<>(FAILURE_RESULT, code, msg, null);
    }
}
