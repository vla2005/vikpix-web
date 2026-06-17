import '../register/style.css'
import { useEffect, useState } from 'react'
import AuthBackground from '@/components/AuthBackground'
import AuthToast from '@/components/AuthToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch, parseApiResponse } from '@/lib/api'
import { navigate } from '@/lib/navigation'

function getNextPath() {
  const params = new URLSearchParams(window.location.search)
  const next = params.get('next')
  const storedNext = sessionStorage.getItem('vikpix_confirm_password_next')

  if (!next || !next.startsWith('/')) {
    return storedNext || '/settings/profile'
  }

  return next
}

function ConfirmPasswordPage() {
  const [nextPath] = useState(getNextPath)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeout = window.setTimeout(() => setToast(null), 2200)

    return () => window.clearTimeout(timeout)
  }, [toast])

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setToast(null)

    try {
      const response = await apiFetch('/auth/confirm-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      const data = await parseApiResponse(response)

      if (!response.ok || data?.confirmed !== true) {
        throw new Error('invalid-password')
      }

      sessionStorage.removeItem('vikpix_confirm_password_next')
      navigate(nextPath, { confirmedPassword: true })
    } catch {
      setToast({
        type: 'error',
        title: 'Não foi possível confirmar',
        message: 'Confira sua senha e tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page" aria-label="Confirmação de senha">
      <AuthBackground patternId="auth-confirm-password-grid" />

      <AuthToast type={toast?.type} title={toast?.title} message={toast?.message} />

      <section className="relative z-[1] mx-auto flex min-h-dvh w-[min(448px,calc(100vw-32px))] -translate-y-[2vh] flex-col justify-center py-10">
        <div className="brand-mark mb-7 ml-1" aria-label="VikPix">
          <span className="brand-icon">
            <span></span>
            <span></span>
          </span>
          <span>VikPix</span>
        </div>

        <form
          className="signup-card w-full px-7 py-[30px] max-[560px]:px-5"
          onSubmit={handleSubmit}
        >
          <header>
            <h1>Confirme sua senha</h1>
            <p>Esta é uma área segura da aplicação. Confirme sua senha para continuar.</p>
          </header>

          <Label>
            <span>Senha</span>
            <Input
              name="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          </Label>

          <Button className="create-button" type="submit" disabled={loading || !password}>
            {loading ? 'Confirmando...' : 'Confirmar senha'}
          </Button>
        </form>
      </section>
    </main>
  )
}

export default ConfirmPasswordPage
