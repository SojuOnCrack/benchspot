import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (patch: Pick<Profile, 'username'> & Partial<Pick<Profile, 'display_name' | 'bio'>>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const userId = session?.user?.id
  const userEmail = session?.user?.email
  const userMetadataUsername = session?.user?.user_metadata?.username

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }

    const fallbackUsername = String(userMetadataUsername || userEmail?.split('@')[0] || 'benchspot')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'benchspot'

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) {
          setProfile(null)
          return
        }

        if (data) {
          setProfile(data as Profile)
          return
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({ id: userId, username: fallbackUsername }, { onConflict: 'id' })
          .select()
          .maybeSingle()

        setProfile(createError ? null : createdProfile as Profile | null)
      })
  }, [userEmail, userId, userMetadataUsername])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signUp(email, password, username) {
      const cleanUsername = username.trim()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: cleanUsername } },
      })
      if (error) throw error
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: data.user.id, username: cleanUsername }, { onConflict: 'id' })
        if (profileError) throw profileError
      }
    },
    async signInWithOAuth(provider) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    },
    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
    },
    async updateProfile(patch) {
      if (!userId) throw new Error('Nicht angemeldet')
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: patch.username,
          display_name: patch.display_name ?? null,
          bio: patch.bio ?? null,
        }, { onConflict: 'id' })
        .select()
        .maybeSingle()

      if (error) throw error
      await supabase.auth.updateUser({ data: { username: patch.username } })
      setProfile(data as Profile | null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return ctx
}
