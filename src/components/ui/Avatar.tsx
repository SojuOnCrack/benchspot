import type { Profile } from '@/types/database'

interface AvatarProps {
  profile?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
  userId?: string | null
  size?: 'sm' | 'lg'
}

function initials(profile?: AvatarProps['profile'], userId?: string | null) {
  const source = profile?.display_name || profile?.username || userId || 'BS'
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BS'
}

export default function Avatar({ profile, userId, size = 'sm' }: AvatarProps) {
  const className = size === 'lg'
    ? 'h-20 w-20 text-xl'
    : 'h-8 w-8 text-xs'

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        className={`${className} rounded-full border border-forest-100 bg-white object-cover dark:border-white/10`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} flex items-center justify-center rounded-full border border-forest-100 bg-forest-100 font-semibold text-forest-700 dark:border-white/10 dark:bg-forest-900 dark:text-forest-100`}
    >
      {initials(profile, userId)}
    </div>
  )
}
