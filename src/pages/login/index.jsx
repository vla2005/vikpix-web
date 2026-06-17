import '../register/style.css'
import './style.css'
import { useEffect, useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { navigate } from '@/lib/navigation'
import AuthBackground from '@/components/AuthBackground'
import AuthToast from '@/components/AuthToast'

const backgroundVideo = 'https://reactpix.com/images/reactpix.webm'
const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'

function loginWithGoogle(rememberMe) {
  const params = new URLSearchParams({
    rememberMe: String(Boolean(rememberMe)),
  })

  window.location.href = `${apiUrl}/auth/oauth/google?${params}`
}

async function parseResponse(response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return { message: responseText }
  }
}

function TwoFactorLoginModal({
  open,
  code,
  loading,
  onClose,
  onCodeChange,
  onConfirm,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/82 px-4 backdrop-blur-[2px]">
      <section className="relative w-[min(448px,calc(100vw-32px))] rounded-lg border border-white/12 bg-[#121212] px-8 py-6 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <button
          className="absolute right-4 top-4 grid size-7 place-items-center rounded-full border-0 bg-transparent text-[#9aa0a6] transition hover:text-white"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <div className="mx-auto grid size-[54px] place-items-center rounded-full border border-white/10 bg-[#202020] shadow-[inset_0_0_0_6px_rgba(255,255,255,0.035)]">
          <ShieldCheck className="size-6 text-[#d7dbde]" strokeWidth={1.7} />
        </div>

        <h2 className="mb-2 mt-8 text-[20px] font-extrabold tracking-[-0.025em] text-[#e9ecef]">
          Verifique sua autenticação
        </h2>
        <p className="mx-auto mb-6 max-w-[360px] text-sm leading-5 text-[#8d9399]">
          Informe o código do aplicativo autenticador ou um código de recuperação.
        </p>

        <Input
          className="mb-5 h-11 rounded-lg border-white/10 bg-[#101010] px-4 text-center font-mono text-sm tracking-[0.12em] text-white shadow-none focus:border-[#25c2d4] focus:shadow-[0_0_0_2px_rgba(37,194,212,0.35)]"
          value={code}
          onChange={(event) => onCodeChange(event.target.value.trim())}
          placeholder="123456 ou AAAA-BBBB-CCCC"
          autoFocus
        />

        <Button
          className="h-11 w-full rounded-full border-0 bg-[#28b9ca] px-4 text-sm font-medium text-[#071315] shadow-none hover:bg-[#28b9ca] hover:brightness-105 disabled:opacity-60"
          type="button"
          disabled={loading || !code}
          onClick={onConfirm}
        >
          {loading ? 'Verificando...' : 'Confirmar'}
        </Button>
      </section>
    </div>
  )
}

function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorChallengeToken, setTwoFactorChallengeToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
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
    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')
    const rememberMe = formData.get('rememberMe') === 'on'

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      const data = await parseResponse(response)

      if (!response.ok) {
        throw new Error('E-mail ou senha inválidos.')
      }

      if (data?.status === 'TWO_FACTOR_REQUIRED' && data?.challengeToken) {
        setTwoFactorChallengeToken(data.challengeToken)
        setTwoFactorCode('')
        return
      }

      form.reset()
      setSuccess('Login realizado com sucesso.')
      window.setTimeout(() => {
        navigate('/dashboard')
      }, 600)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyTwoFactor() {
    setError('')
    setSuccess('')
    setTwoFactorLoading(true)

    try {
      const response = await fetch(`${apiUrl}/auth/2fa/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          challengeToken: twoFactorChallengeToken,
          code: twoFactorCode,
        }),
      })

      const data = await parseResponse(response)

      if (!response.ok || !data?.authenticated) {
        throw new Error('two-factor-failed')
      }

      setTwoFactorChallengeToken('')
      setTwoFactorCode('')
      setSuccess('Login realizado com sucesso.')
      window.setTimeout(() => {
        navigate('/dashboard')
      }, 600)
    } catch {
      setError('Não foi possível verificar o código.')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleGoogleLogin(event) {
    setError('')

    try {
      const rememberMe = event.currentTarget.form?.elements.rememberMe?.checked || false

      loginWithGoogle(rememberMe)
    } catch {
      setError('Erro ao iniciar login com Google.')
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

      <TwoFactorLoginModal
        open={Boolean(twoFactorChallengeToken)}
        code={twoFactorCode}
        loading={twoFactorLoading}
        onClose={() => {
          setTwoFactorChallengeToken('')
          setTwoFactorCode('')
        }}
        onCodeChange={setTwoFactorCode}
        onConfirm={handleVerifyTwoFactor}
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
            <p className="eyebrow">DOACOES AO VIVO</p>
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
                <p>Salve! Conteudo bom demais.</p>
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
