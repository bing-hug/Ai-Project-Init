import type { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * @description 后端 API 返回的基础结构。
 * @template T - data 负载的具体类型，使用 unknown 保证类型安全。
 */
export interface ApiResponse<T = unknown> {
  result: number
  code: number
  msg: string
  data: T
}

/**
 * @description 扩展 AxiosInstance 类型，添加我们自定义的、强类型的快捷方法。
 *              这些方法将直接返回解包后的数据。
 */
export interface AxiosStatic extends AxiosInstance {
  /**
   * @description 发起一个 GET 请求，并返回解包后的 data。
   * @template T - 期望的 `data` 负载类型。
   * @returns {Promise<T>} 一个 Promise，其解析值为类型为 T 的数据。
   */
  GET: <T = unknown>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig
  ) => Promise<T>

  /**
   * @description 发起一个 POST 请求，并返回解包后的 data。
   * @template T - 期望的 `data` 负载类型。
   */
  POST: <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ) => Promise<T>

  /**
   * @description 发起一个 PUT 请求，并返回解包后的 data。
   * @template T - 期望的 `data` 负载类型。
   */
  PUT: <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ) => Promise<T>

  /**
   * @description 发起一个 DELETE 请求，并返回解包后的 data。
   * @template T - 期望的 `data` 负载类型。
   */
  DELETE: <T = unknown>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig
  ) => Promise<T>
}
