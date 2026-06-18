import { FormEvent, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  Mic2,
  Plus,
  Sparkles,
  Target,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'

type Lesson = {
  id: number
  language: string
  level: string
  skill: string
  date: string
  time: string
  duration: string
  tutor: string
}

const languages = ['English', 'Japanese', 'Korean', 'Chinese', 'French', 'German']
const levels = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced']
const skills = ['Speaking', 'Listening', 'Vocabulary', 'Grammar', 'Business', 'Exam prep']
const timeSlots = ['07:30', '09:00', '10:30', '13:30', '15:00', '18:30', '20:00']
const tutors = ['Linh Nguyen', 'Mika Tanaka', 'Daniel Park', 'Emma Wilson']

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(date))
}

function makeDateOptions() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return {
      value: toInputDate(date),
      label: formatDate(toInputDate(date)),
      isToday: index === 0,
    }
  })
}

const seedLessons: Lesson[] = [
  {
    id: 1,
    language: 'English',
    level: 'Intermediate',
    skill: 'Speaking',
    date: toInputDate(new Date()),
    time: '18:30',
    duration: '45 phút',
    tutor: 'Emma Wilson',
  },
  {
    id: 2,
    language: 'Japanese',
    level: 'Beginner',
    skill: 'Vocabulary',
    date: toInputDate(new Date(Date.now() + 86400000 * 2)),
    time: '20:00',
    duration: '30 phút',
    tutor: 'Mika Tanaka',
  },
]

export default function LanguageLearning() {
  const dateOptions = useMemo(makeDateOptions, [])
  const [lessons, setLessons] = useState<Lesson[]>(seedLessons)
  const [language, setLanguage] = useState(languages[0])
  const [level, setLevel] = useState(levels[2])
  const [skill, setSkill] = useState(skills[0])
  const [date, setDate] = useState(dateOptions[1].value)
  const [time, setTime] = useState(timeSlots[5])
  const [duration, setDuration] = useState('45 phút')
  const [tutor, setTutor] = useState(tutors[0])

  const completedLessons = 18
  const weeklyTarget = 5
  const bookedThisWeek = lessons.length
  const nextLesson = [...lessons].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0]

  const handleBookLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isTaken = lessons.some((lesson) => lesson.date === date && lesson.time === time)
    if (isTaken) {
      toast.error('Khung giờ này đã có lịch học. Chọn giờ khác nhé.')
      return
    }

    const newLesson: Lesson = {
      id: Date.now(),
      language,
      level,
      skill,
      date,
      time,
      duration,
      tutor,
    }

    setLessons((current) => [newLesson, ...current])
    toast.success(`Đã đặt lịch ${language} vào ${formatDate(date)} lúc ${time}`)
  }

  const removeLesson = (id: number) => {
    setLessons((current) => current.filter((lesson) => lesson.id !== id))
    toast.info('Đã hủy lịch học')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Languages className="w-8 h-8 text-sky-400" />
            Học ngoại ngữ
          </h1>
          <p className="text-muted mt-1">Chọn ngày trước, sau đó đặt khung giờ học phù hợp.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info">
            <Sparkles className="w-3.5 h-3.5" />
            AI study plan
          </span>
          <span className="badge badge-success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {bookedThisWeek}/{weeklyTarget} buổi tuần này
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card stat-card-primary">
          <div className="flex items-center gap-3">
            <div className="icon-bubble icon-bubble-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase">Bài đã học</p>
              <p className="text-2xl font-black text-white">{completedLessons}</p>
            </div>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="flex items-center gap-3">
            <div className="icon-bubble icon-bubble-info">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase">Mục tiêu hiện tại</p>
              <p className="text-2xl font-black text-white">Speaking</p>
            </div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="flex items-center gap-3">
            <div className="icon-bubble icon-bubble-success">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase">Buổi tiếp theo</p>
              <p className="text-lg font-black text-white">
                {nextLesson ? `${formatDate(nextLesson.date)} - ${nextLesson.time}` : 'Chưa có'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleBookLesson} className="card xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-400" />
                Đặt lịch học
              </h2>
              <p className="text-xs text-muted mt-1">Chọn ngày trước để khóa lịch, rồi chọn giờ và nội dung học.</p>
            </div>
            <span className="badge badge-primary">Live 1:1</span>
          </div>

          <div>
            <label className="label">Ngày học</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDate(option.value)}
                  className={`rounded-xl px-3 py-3 text-left border transition-all ${
                    date === option.value
                      ? 'bg-sky-500/15 border-sky-400/60 text-white'
                      : 'bg-white/5 border-white/10 text-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="block text-xs font-bold">{option.isToday ? 'Hôm nay' : option.label}</span>
                  <span className="block text-[10px] mt-1">{option.value.slice(5)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Ngôn ngữ</label>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="input">
                {languages.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Trình độ</label>
              <select value={level} onChange={(event) => setLevel(event.target.value)} className="input">
                {levels.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kỹ năng tập trung</label>
              <select value={skill} onChange={(event) => setSkill(event.target.value)} className="input">
                {skills.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gia sư</label>
              <select value={tutor} onChange={(event) => setTutor(event.target.value)} className="input">
                {tutors.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Khung giờ</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`btn ${time === slot ? 'btn-info' : 'btn-secondary'} text-xs py-2`}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-48">
              <label className="label">Thời lượng</label>
              <select value={duration} onChange={(event) => setDuration(event.target.value)} className="input">
                <option>30 phút</option>
                <option>45 phút</option>
                <option>60 phút</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary sm:flex-1">
              <Plus className="w-4 h-4" />
              Đặt lịch học
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              Lộ trình hôm nay
            </h2>
            <div className="space-y-3">
              {['Warm-up 10 từ mới', 'Shadowing 12 phút', 'Role-play theo chủ đề', 'Ôn lỗi phát âm'].map((task, index) => (
                <div key={task} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xs font-black">
                    {index + 1}
                  </div>
                  <span className="text-sm text-white font-semibold">{task}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              Gợi ý cấp tốc
            </h2>
            <div className="alert alert-info">
              <Video className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Đặt lịch trước ít nhất 1 ngày để hệ thống chuẩn bị giáo án theo mục tiêu của bạn.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-sky-400" />
            Lịch đã đặt
          </h2>
          <span className="text-xs text-muted">{lessons.length} buổi</span>
        </div>

        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="transfer-row justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="icon-bubble icon-bubble-info">
                  <Languages className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">
                    {lesson.language} - {lesson.skill}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(lesson.date)} lúc {lesson.time} - {lesson.duration} - {lesson.tutor}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => removeLesson(lesson.id)} className="btn btn-ghost text-xs">
                Hủy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
