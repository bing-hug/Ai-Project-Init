import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import axios from 'axios'
import type { ApiResponse, AxiosStatic } from './type.ts'
import { ElMessage } from 'element-plus'

// 统一前缀：开发期由 Vite 代理、生产由 Nginx 转发，前后端都保持 /api，不做前缀增删
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const http = axios.create({
  baseURL,
  timeout: 30000
}) as AxiosStatic

function showError(msg: string): void {
  ElMessage.error(msg)
}

const handleRequestError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const typedError = error as AxiosError<ApiResponse<unknown>>
    if (
      typedError.code === 'ECONNABORTED' ||
      typedError.message.includes('timeout')
    ) {
      showError('请求超时，请检查您的网络')
    } else if (typedError.message === 'Network Error') {
      showError('网络开小差啦，请稍后重试~')
    } else {
      const apiMessage = typedError.response?.data?.msg
      showError(apiMessage || '服务器繁忙，请稍后重试')
    }
  } else {
    console.error('捕获到非 http 错误:', error)
    showError('发生未知错误，请稍后重试')
  }
  return Promise.reject(error)
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config
}, handleRequestError)

http.interceptors.response.use(
  async <T>(response: AxiosResponse<ApiResponse<T>>) => {
    const data = response.data
    /**
     * 平板获取用户接口特殊处理
     */
    if (response.config.baseURL === '/system') {
      if (data.result === -1) {
        throw new Error((data.data as string) || 'Error')
      }
      return response
    }

    /**
     * 获取视频数据
     */
    if (response.headers['content-type'] === 'video/mp4') {
      return response
    }

    if (!data) {
      showError('服务返回内容为空')
      throw new Error('服务返回内容为空')
    }

    /**
     * 业务层兜底：HTTP 200 但 result=-1 / code≠0 也按失败处理
     */
    if (data.result === -1 || data.code !== 0) {
      const msg = data.msg || '请求失败'
      showError(msg)
      throw new Error(msg)
    }

    return response
  },
  handleRequestError
)

http.GET = async <T>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await http.get<ApiResponse<T>>(url, { ...config, params })
  return res.data.data
}

http.POST = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await http.post<ApiResponse<T>>(url, data, config)
  return res.data.data
}

http.PUT = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await http.put<ApiResponse<T>>(url, data, config)
  return res.data.data
}

http.DELETE = async <T>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await http.delete<ApiResponse<T>>(url, { ...config, params })
  return res.data.data
}

export default http
