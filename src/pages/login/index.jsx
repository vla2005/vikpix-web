import '../register/style.css'
import './style.css'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithProvider } from '@/lib/keycloak'
import { navigate } from '@/lib/navigation'
import AuthBackground from '@/components/AuthBackground'
import AuthToast from '@/components/AuthToast'

const backgroundVideo = 'https://reactpix.com/images/reactpix.webm'

function LoginPage() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!error && !success) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setError('')
      setSuccess('')
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [error, success])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')
    const rememberMe = formData.get('rememberMe') === 'on'

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      const responseText = await response.text()
      let data = null

      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch {
          data = { message: responseText }
        }
      }

      if (!response.ok) {
      throw new Error(data?.message || 'E-mail ou senha inválidos.')
    }

      form.reset()
      setSuccess('Login realizado com sucesso.')
      window.setTimeout(() => {
        navigate('/dashboard')
      }, 600)
    } catch (error) {
      setError(error.message || 'Não foi possível entrar no sistema.');
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')

    try {
      loginWithProvider('google')
    } catch (error) {
      setError(error.message || 'Erro ao iniciar login com Google.')
    }
  }

  return (
    <main className="register-page" aria-label="Login ReactPix">
      <AuthBackground patternId="auth-landing-login-grid" />

      <AuthToast
        type={error ? 'error' : 'success'}
        title={error ? 'Não foi possível entrar' : 'Login realizado'}
        message={error || success}
      />

      <section className="register-shell">
        <div className="brand-mark" aria-label="ReactPix">
          <span className="brand-icon">
            <span></span>
            <span></span>
          </span>
          <span>VikPix</span>
        </div>

        <div className="register-layout">
          <form className="signup-card login-card" onSubmit={handleSubmit}>
            <header>
              <h1>Acesse sua conta</h1>
              <p>Entre com seu e-mail e senha para continuar.</p>
            </header>

            <div className="social-stack">
              <Button
                className="social-button"
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  width="24"
                  height="24"
                  className="google-icon"
                >
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
                </svg>
                Continuar com Google
              </Button>
            </div>

            <div className="email-divider">
              <span>OU CONTINUE COM E-MAIL</span>
            </div>

            <Label>
              <span>E-mail</span>
              <Input name="email" autoFocus type="email" placeholder="email@example.com" />
            </Label>

            <Label>
              <span className="login-label-row">
                Senha
                <a href="/forgot-password">Esqueceu sua senha?</a>
              </span>
              <Input name="password" type="password" placeholder="Senha" />
            </Label>

            <label className="remember-row">
              <input name="rememberMe" type="checkbox" />
              <span>Lembrar de mim</span>
            </label>

            <Button className="create-button" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="login-copy">
              Ainda não tem conta? <a href="/register">Criar conta</a>
            </p>
          </form>

          <aside className="showcase" aria-label="Demonstração do ReactPix">
            <p className="eyebrow">DOAÇÕES AO VIVO</p>
            <h2>Alertas e interações com visual de transmissão</h2>
            <p className="showcase-copy">
              Configure em minutos e deixe sua live com cara profissional desde o
              primeiro dia.
            </p>

            <div className="stream-card">
              <video className="stream-video" autoPlay muted loop playsInline>
                <source src={backgroundVideo} type="video/webm" />
              </video>
              <div className="stream-panel">
                <span className="panel-dot"></span>
                <span>@pixelstudio</span>
              </div>
              <div className="donation-bubble">
                <div>
                  <strong>@viewer123</strong>
                  <b>R$ 20,00</b>
                </div>
                <p>Salve! Conteúdo bom demais.</p>
              </div>
            </div>

            <div className="status-bar">
              <span>Status da transmissão</span>
              <strong>
                <i></i>
                Online
              </strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
