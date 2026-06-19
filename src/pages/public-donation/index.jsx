import { useEffect, useMemo, useState } from 'react'
import { EyeOff, Mic, Send, UserRound } from 'lucide-react'
import './style.css'

const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'
const messageLimit = 250

function formatCurrencyFromCents(cents) {
  const value = Number(cents || 200) / 100

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatAmountInput(digits) {
  if (!digits) return ''

  const value = Number(digits) / 100

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getInitials(userName) {
  if (!userName) return 'VP'

  return userName
    .replace(/^@/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function normalizeMainColor(color) {
  if (typeof color !== 'string') return '#0ea5e9'

  const trimmedColor = color.trim()

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmedColor)) {
    return trimmedColor
  }

  return '#0ea5e9'
}

function PublicDonationBackground({ accent = '#0ea5e9' }) {
  return (
    <div
      className="vikpix-bg"
      aria-hidden="true"
      style={{ '--vk-main': accent }}
    >
      <div className="vikpix-bg__base" />
      <div className="vikpix-bg__grid" />

      <div className="vikpix-bg__glow vikpix-bg__glow--left" />
      <div className="vikpix-bg__glow vikpix-bg__glow--right" />
      <div className="vikpix-bg__glow vikpix-bg__glow--bottom" />

      <div className="vikpix-bg__beam vikpix-bg__beam--one" />
      <div className="vikpix-bg__beam vikpix-bg__beam--two" />
      <div className="vikpix-bg__beam vikpix-bg__beam--three" />

      <img
        className="vikpix-bg__logo"
        src="/logo-sem-fundo.png"
        alt=""
      />

      <span className="vikpix-bg__spark vikpix-bg__spark--one" />
      <span className="vikpix-bg__spark vikpix-bg__spark--two" />

      <div className="vikpix-bg__shade" />
    </div>
  )
}

function PublicDonationPage({ userName }) {
  const [donationPage, setDonationPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [amountCents, setAmountCents] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadDonationPage() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiUrl}/donation-page/${encodeURIComponent(userName)}`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('not-found')
        }

        const data = await response.json()

        setDonationPage(data)
        setAmountCents('')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Não foi possível carregar esta página de doação.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDonationPage()

    return () => controller.abort()
  }, [userName])

  const mainColor = normalizeMainColor(donationPage?.mainColor || '#0ea5e9')
  const resolvedUserName = donationPage?.userName || userName
  const publicUserName = resolvedUserName?.startsWith('@')
    ? resolvedUserName
    : `@${resolvedUserName}`

  const minValue = useMemo(
    () => formatCurrencyFromCents(donationPage?.minCents),
    [donationPage?.minCents],
  )

  const isInactive = donationPage && donationPage.active === false

  function handleSubmit(event) {
    event.preventDefault()
  }

  if (loading) {
    return (
      <main
        className="public-donation-page"
        style={{ '--vk-main': '#0ea5e9' }}
      >
        <PublicDonationBackground accent="#0ea5e9" />

        <div className="donation-loading">
          <div className="donation-loading__card" />
        </div>
      </main>
    )
  }

  if (error || !donationPage) {
    return (
      <main
        className="public-donation-page"
        style={{ '--vk-main': '#0ea5e9' }}
      >
        <PublicDonationBackground accent="#0ea5e9" />

        <section className="donation-error-card">
          <h1>Página indisponível</h1>
          <p>{error || 'Não encontramos esta página de doação.'}</p>
        </section>
      </main>
    )
  }

  return (
    <main
      className="public-donation-page"
      style={{ '--vk-main': mainColor }}
    >
      <PublicDonationBackground accent={mainColor} />

      <div className="donation-page-content">
        <form className="donation-card" onSubmit={handleSubmit}>
          <header className="donation-profile">
            <span className="donation-avatar">
              {donationPage.avatarUrl ? (
                <img
                  src={donationPage.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(resolvedUserName)
              )}
            </span>

            <div className="donation-profile__content">
              <strong>{publicUserName}</strong>
              <span />
            </div>
          </header>

          {!anonymous && (
            <label className="donation-field">
              <span className="sr-only">Seu nome</span>

              <input
                placeholder="Seu nome"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                disabled={isInactive}
              />

              <UserRound className="donation-field__icon" />
            </label>
          )}

          <button
            className={`donation-toggle ${anonymous ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              setAnonymous((current) => {
                const nextValue = !current

                if (nextValue) {
                  setDisplayName('')
                }

                return nextValue
              })
            }}
            disabled={isInactive}
          >
            <span className="donation-toggle__label">
              <EyeOff />
              Doar de forma anônima
            </span>

            <span className="donation-toggle__switch">
              <span />
            </span>
          </button>

          <label className="donation-field donation-field--textarea">
            <span className="sr-only">Sua mensagem</span>

            <textarea
              maxLength={messageLimit}
              placeholder="Sua mensagem..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isInactive}
            />

            <Mic className="donation-field__icon donation-field__icon--textarea" />
          </label>

          <div className="donation-amount">
            <strong>Valor</strong>

            <label className="donation-field donation-field--amount">
              <span className="sr-only">Valor da doação</span>

              <span className="donation-amount__prefix">R$</span>

              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0,00"
                value={formatAmountInput(amountCents)}
                onChange={(event) => setAmountCents(event.target.value.replace(/\D/g, ''))}
                disabled={isInactive}
              />
            </label>

            <p>Mínimo: {minValue}</p>
          </div>

          <button
            className="donation-submit"
            type="submit"
            disabled={isInactive}
          >
            <Send />
            {isInactive ? 'Página indisponível' : 'Enviar PIX'}
          </button>
        </form>

        <p className="donation-terms">
          Ao utilizar nosso serviço, você concorda com os nossos{' '}
          <a href="/terms">Termos de Uso</a>
          <br />
          e com a nossa{' '}
          <a href="/privacy">Política de Privacidade</a>.
        </p>

        <div className="donation-brand">
          <span>
            <img src="/logo-sem-fundo.png" alt="" />
          </span>

          <strong>VikPix</strong>
        </div>
      </div>
    </main>
  )
}

export default PublicDonationPage