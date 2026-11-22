import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { AppProvider } from './context/AppContext'
import { Toast } from './components/Toast'
import { LoginPage, RegisterPage, AdminLoginPage } from './pages/auth/AuthPages'
import { UserApp } from './pages/user/UserApp'
import { AdminApp } from './pages/admin/AdminApp'

// screen: 'login' | 'register' | 'admin-login' | 'user' | 'admin'
export default function App() {
  const [screen, setScreen] = useState('login')

  useEffect(() => {
    // Cek apakah sudah login sebelumnya
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setScreen('user')
    })
    // Listener perubahan auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setScreen((prev) => (prev === 'admin' || prev === 'admin-login' || prev === 'register' ? prev : 'login'))
      } else {
        setScreen('user')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppProvider>
      {screen === 'login'       && <LoginPage       onShowReg={() => setScreen('register')} onShowAdmin={() => setScreen('admin-login')} onLoggedIn={(role) => setScreen(role)} />}
      {screen === 'register'    && <RegisterPage     onShowLogin={() => setScreen('login')} onLoggedIn={(role) => setScreen(role)} />}
      {screen === 'admin-login' && <AdminLoginPage   onShowLogin={() => setScreen('login')} onLoggedIn={(role) => setScreen(role)} />}
      {screen === 'user'        && <UserApp          onLogout={(target) => setScreen(target || 'login')} onNavigateScreen={(s) => setScreen(s)} />}
      {screen === 'admin'       && <AdminApp         onLogout={(target) => setScreen(target || 'login')} />}
      <Toast />
    </AppProvider>
  )
}
