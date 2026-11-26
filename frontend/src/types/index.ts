export interface ChapterItem {
  fun_catalog: string
  id: number
  lesson: string
  lesson_id: string
  summary: number
  unit: string
}

export interface VideoItem {
  group_id: number
  is_local: boolean
  local_path: null
  video_cover: string
  video_id: string
  video_info_intro: null
  video_info_teacher: null
  video_module: string
  video_tag: string
}

export interface CollectionVideoItem extends VideoItem {
  date: string
  subjectName: string
}

export interface VideoPlayInfo {
  playUrl: string
  source: string
}

export interface EditorItem {
  edition_id: string
  edition_name: string
}

export interface BookItem {
  id: number
  subject_id: string
  subject_name: string
  grade_id: string
  grade_name: string
  edition_id: string
  edition_name: string
  term_id: string
  term_name: string
  phase_id: string
  required_id: string | null
  required_name: string | null
  publish_name: string | null
  printing_name: string
  synced_at: string // ISO 8601 日期时间字符串
  video_synced_at: string // ISO 8601 日期时间字符串
}

export interface SubjectItem {
  phase_name: string // 学籍
  subject_id: string
  subject_name: string
}

export interface PhaseItem {
  phase_id: string
  phase_name: string
  subjects: {
    subject_id: string
    subject_name: string
    editions: EditorItem[]
    terms: {
      term_id: string
      term_name: string
    }
  }[]
}

export interface User {
  name: string
  pwdInited: number
  key: string
  sign: number
  icon: string
  id: string
  school: string
  scid: string
  job: string
  userType: number
  grade: number
  subjects: {
    id: string
    name: string
    color: string
  }[]
}
