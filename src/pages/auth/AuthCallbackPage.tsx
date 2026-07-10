import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageSkeleton from '@/components/ui/PageSkeleton'
import { useAuth } from '@/hooks/useAuthContext'

export default function AuthCallbackPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    const next = new URLSearchParams(location.search).get('next') || '/'
    navigate(session ? next : '/login', { replace: true })
  }, [loading, location.search, navigate, session])

  return <PageSkeleton />
}
