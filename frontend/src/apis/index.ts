import http from '@/request'
import type { User } from '@/types'

export const getUserInfoByKeyApi = (key: string) => {
  const params = {
    cmd: 'School',
    mode: 'relogin',
    key
  }
  return http.GET<User>('/getUser', params)
}
