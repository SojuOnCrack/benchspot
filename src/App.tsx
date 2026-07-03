import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import PageSkeleton from '@/components/ui/PageSkeleton'
import ProtectedRoute from '@/routes/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const BenchDetailPage = lazy(() => import('@/pages/BenchDetailPage'))
const AddBenchPage = lazy(() => import('@/pages/AddBenchPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/bank/:id" element={<BenchDetailPage />} />
          <Route
            path="/hinzufuegen"
            element={
              <ProtectedRoute>
                <AddBenchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoriten"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrieren" element={<RegisterPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
