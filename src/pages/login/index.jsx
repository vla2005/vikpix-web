import '../register/style.css'
import './style.css'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/api'

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
      await login({
        email,
        password,
        rememberMe,
      })

      form.reset()
      setSuccess('Login realizado com sucesso.')
      window.setTimeout(() => {
        window.location.assign('/dashboard')
      }, 900)
    } catch (error) {
      setError(error.message || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page" aria-label="Login ReactPix">
      <div className="scene-grid" aria-hidden="true">
        <svg className="auth-grid" aria-hidden="true">
          <defs>
            <pattern
              id="auth-landing-login-grid"
              width="52"
              height="52"
              patternUnits="userSpaceOnUse"
              x="-1"
              y="-1"
            >
              <path d="M.5 52V.5H52" fill="none" strokeDasharray="0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-landing-login-grid)" />
          <svg x="-1" y="-1" className="auth-grid-squares">
            <rect width="51" height="51" x="53" y="989" opacity="0.19825298472715075" />
            <rect width="51" height="51" x="157" y="1405" opacity="0.18736062109994236" />
            <rect width="51" height="51" x="469" y="1197" opacity="0.1744825949735241" />
            <rect width="51" height="51" x="365" y="625" opacity="0.16039231877948623" />
            <rect width="51" height="51" x="417" y="157" opacity="0.14498063817445656" />
            <rect width="51" height="51" x="365" y="677" opacity="0.12789530384063255" />
            <rect width="51" height="51" x="209" y="157" opacity="0.11008056639984716" />
            <rect width="51" height="51" x="1" y="209" opacity="0.09067312001890969" />
            <rect width="51" height="51" x="365" y="1457" opacity="0.07059292608464603" />
            <rect width="51" height="51" x="53" y="729" opacity="0.04971526171604637" />
            <rect width="51" height="51" x="157" y="1457" opacity="0.026921265802229755" />
            <rect width="51" height="51" x="1" y="209" opacity="0.003477851118077524" />
            <rect width="51" height="51" x="209" y="885" opacity="0" />
            <rect width="51" height="51" x="261" y="1093" opacity="0" />
            <rect width="51" height="51" x="1" y="1197" opacity="0" />
            <rect width="51" height="51" x="1" y="937" opacity="0" />
            <rect width="51" height="51" x="157" y="1301" opacity="0" />
            <rect width="51" height="51" x="417" y="573" opacity="0" />
            <rect width="51" height="51" x="261" y="781" opacity="0" />
            <rect width="51" height="51" x="469" y="261" opacity="0" />
            <rect width="51" height="51" x="53" y="157" opacity="0" />
            <rect width="51" height="51" x="261" y="1301" opacity="0" />
            <rect width="51" height="51" x="209" y="833" opacity="0" />
            <rect width="51" height="51" x="313" y="417" opacity="0.0081896720075747" />
            <rect width="51" height="51" x="209" y="1301" opacity="0.020057874079211616" />
            <rect width="51" height="51" x="417" y="261" opacity="0.03157914893992711" />
            <rect width="51" height="51" x="261" y="989" opacity="0.042744369824067686" />
            <rect width="51" height="51" x="157" y="937" opacity="0.05374768229376059" />
          </svg>
        </svg>
      </div>
      <div className="scene-shade" aria-hidden="true"></div>

      {(error || success) && (
        <div
          className={`register-toast ${error ? 'register-toast-error' : 'register-toast-success'}`}
          role="status"
          aria-live="polite"
        >
          {error ? <AlertCircle /> : <CheckCircle2 />}
          <div>
            <strong>{error ? 'Não foi possível entrar' : 'Login realizado'}</strong>
            <span>{error || success}</span>
          </div>
        </div>
      )}

      <section className="register-shell">
        <div className="brand-mark" aria-label="ReactPix">
          <span className="brand-icon">
            <span></span>
            <span></span>
          </span>
          <span>ReactPix</span>
        </div>

        <div className="register-layout">
          <form className="signup-card login-card" onSubmit={handleSubmit}>
            <header>
              <h1>Acesse sua conta</h1>
              <p>Entre com seu e-mail e senha para continuar.</p>
            </header>

            <div className="social-stack">
              <Button className="social-button" type="button" variant="outline">
                <span className="youtube-icon">▶</span>
                Continuar com YouTube
              </Button>
              <Button className="social-button" type="button" variant="outline">
                <span className="twitch-icon">◱</span>
                Continuar com Twitch
              </Button>
              <Button className="social-button" type="button" variant="outline">
                <span className="kick-icon">K</span>
                Continuar com Kick
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
                <a href="/login">Esqueceu sua senha?</a>
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
            <p className="eyebrow">REACTPIX AO VIVO</p>
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
