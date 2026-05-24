import { Facebook, Globe2, Mail, Music2 } from 'lucide-react'

type SocialLoginButtonsProps = {
  mode?: 'login' | 'register'
}

const providers = [
  {
    id: 'google',
    label: 'Google',
    icon: 'G',
    iconClass: 'bg-white text-[#4285f4] border border-gray-200',
    buttonClass: 'hover:border-[#4285f4] hover:bg-blue-50',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: <Facebook className="h-4 w-4" />,
    iconClass: 'bg-[#1877f2] text-white',
    buttonClass: 'hover:border-[#1877f2] hover:bg-blue-50',
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    icon: 'MS',
    iconClass: 'bg-[#f25022] text-white',
    buttonClass: 'hover:border-[#7fba00] hover:bg-green-50',
  },
  {
    id: 'zalo',
    label: 'Zalo',
    icon: <Mail className="h-4 w-4" />,
    iconClass: 'bg-[#0068ff] text-white',
    buttonClass: 'hover:border-[#0068ff] hover:bg-blue-50',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: <Music2 className="h-4 w-4" />,
    iconClass: 'bg-black text-white',
    buttonClass: 'hover:border-black hover:bg-gray-50',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: <Globe2 className="h-4 w-4" />,
    iconClass: 'bg-pink-600 text-white',
    buttonClass: 'hover:border-pink-500 hover:bg-pink-50',
  },
]

function socialAuthUrl(provider: string) {
  const configuredBase = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '')
  const target = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
    ? '?target=mobile'
    : ''
  if (configuredBase) return `${configuredBase}/auth/social/${provider}${target}`
  return `/api/auth/social/${provider}${target}`
}

export default function SocialLoginButtons({ mode = 'login' }: SocialLoginButtonsProps) {
  const actionLabel = mode === 'register' ? 'Đăng ký' : 'Đăng nhập'

  const handleSocialLogin = (provider: string) => {
    window.location.href = socialAuthUrl(provider)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialLogin(provider.id)}
            className={`h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${provider.buttonClass}`}
            title={`${actionLabel} bằng ${provider.label}`}
            aria-label={`${actionLabel} bằng ${provider.label}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${provider.iconClass}`}
            >
              {provider.icon}
            </span>
            <span className="truncate">{provider.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-500">Hoặc dùng tài khoản thường</span>
        </div>
      </div>
    </div>
  )
}
