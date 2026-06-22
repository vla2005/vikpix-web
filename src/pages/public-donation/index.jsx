import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, ExternalLink, EyeOff, LoaderCircle, Mic, Send, UserRound, XCircle } from 'lucide-react'
import { createDonation, getDonationStatus } from '@/lib/api'
import './style.css'

const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'
const messageLimit = 250
const pendingStatuses = ['PENDING']
const failedStatuses = ['FAILED', 'CANCELED', 'EXPIRED']

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

function getStreamerUserId(donationPage) {
  return donationPage?.userId || donationPage?.streamerId || donationPage?.id || ''
}

function getPixQrCodeImage(qrCodeBase64) {
  if (!qrCodeBase64) return ''

  return qrCodeBase64.startsWith('data:image')
    ? qrCodeBase64
    : `data:image/png;base64,${qrCodeBase64}`
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

function PixPaymentDialog({ copied, payment, status, onBack, onCopy, onReset }) {
  const pix = payment?.pix || {}
  const qrCodeImage = getPixQrCodeImage(pix.qrCodeBase64)
  const isPending = pendingStatuses.includes(status)
  const isPaid = status === 'PAID'
  const isFailed = failedStatuses.includes(status)

  return (
    <div className="pix-payment-overlay" role="dialog" aria-modal="true" aria-labelledby="pix-payment-title">
      <section className="pix-payment-card">
        <div className="pix-payment-status">
          {isPaid ? <CheckCircle2 /> : null}
          {isFailed ? <XCircle /> : null}
          {isPending ? <LoaderCircle className="pix-payment-status__spinner" /> : null}
          <span>
            {isPaid ? 'Pagamento confirmado' : null}
            {isFailed ? 'Pagamento não concluído' : null}
            {isPending ? 'Aguardando pagamento' : null}
          </span>
        </div>

        <h2 id="pix-payment-title">
          {isPaid ? 'Obrigado pela doação!' : 'Pague com Pix'}
        </h2>
        <p>
          {isPaid
            ? 'Sua doação foi confirmada e será enviada para a live.'
            : 'Escaneie o QR Code ou copie o código Pix abaixo para concluir o pagamento.'}
        </p>

        {!isPaid && qrCodeImage ? (
          <div className="pix-payment-qrcode">
            <img src={qrCodeImage} alt="QR Code Pix" />
          </div>
        ) : null}

        {!isPaid && pix.qrCode ? (
          <label className="pix-payment-code">
            <span>Copia e cola Pix</span>
            <textarea readOnly value={pix.qrCode} onFocus={(event) => event.target.select()} />
          </label>
        ) : null}

        {!isPaid && pix.qrCode ? (
          <button className="pix-payment-copy" type="button" onClick={onCopy}>
            <Copy />
            {copied ? 'Código copiado' : 'Copiar código Pix'}
          </button>
        ) : null}

        {!isPaid && pix.ticketUrl ? (
          <a className="pix-payment-link" href={pix.ticketUrl} target="_blank" rel="noreferrer">
            <ExternalLink />
            Abrir pagamento
          </a>
        ) : null}

        {isPending ? (
          <button className="pix-payment-secondary" type="button" onClick={onBack}>
            Voltar e editar doação
          </button>
        ) : null}

        {isPaid || isFailed ? (
          <button className="pix-payment-secondary" type="button" onClick={onReset}>
            Fazer outra doação
          </button>
        ) : null}
      </section>
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
  const [creatingDonation, setCreatingDonation] = useState(false)
  const [donationError, setDonationError] = useState('')
  const [payment, setPayment] = useState(null)
  const [pixCopied, setPixCopied] = useState(false)

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
        setDonationError('')
        setPayment(null)
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

  useEffect(() => {
    if (!payment?.donationId || payment.status !== 'PENDING') {
      return undefined
    }

    const interval = window.setInterval(async () => {
      try {
        const statusResponse = await getDonationStatus(payment.donationId)

        if (!statusResponse?.status) {
          return
        }

        setPayment((currentPayment) => {
          if (!currentPayment || currentPayment.donationId !== payment.donationId) {
            return currentPayment
          }

          return {
            ...currentPayment,
            status: statusResponse.status,
          }
        })
      } catch {
        // O endpoint de status ainda pode não existir. Mantém o Pix em aberto sem quebrar a tela.
      }
    }, 5000)

    return () => window.clearInterval(interval)
  }, [payment?.donationId, payment?.status])

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
  const paymentStatus = payment?.status || 'PENDING'

  async function handleSubmit(event) {
    event.preventDefault()

    if (isInactive || creatingDonation) {
      return
    }

    const streamerUserId = getStreamerUserId(donationPage)
    const nextAmountCents = Number(amountCents || 0)
    const minDonationCents = Number(donationPage?.minCents || 0)

    if (!streamerUserId) {
      setDonationError('Não foi possível identificar o streamer desta página.')
      return
    }

    if (!nextAmountCents || nextAmountCents < minDonationCents) {
      setDonationError(`Informe um valor de pelo menos ${minValue}.`)
      return
    }

    setDonationError('')
    setCreatingDonation(true)

    try {
      const createdDonation = await createDonation({
        userId: streamerUserId,
        donorIp: null,
        donorName: anonymous ? null : displayName.trim() || null,
        amountCents: nextAmountCents,
        message: message.trim() || null,
      })

      setPayment({
        donationId: createdDonation.donationId,
        paymentId: createdDonation.paymentId,
        status: createdDonation.status || 'PENDING',
        pix: createdDonation.pix || {},
      })
    } catch {
      setDonationError('Não foi possível gerar o pagamento Pix. Tente novamente em instantes.')
    } finally {
      setCreatingDonation(false)
    }
  }

  async function copyPixCode() {
    const code = payment?.pix?.qrCode

    if (!code) {
      return
    }

    await navigator.clipboard?.writeText(code)
    setPixCopied(true)
    window.setTimeout(() => setPixCopied(false), 2000)
  }

  function resetDonation() {
    setDisplayName('')
    setAnonymous(false)
    setMessage('')
    setAmountCents('')
    setDonationError('')
    setPixCopied(false)
    setPayment(null)
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

      {payment ? (
        <PixPaymentDialog
          copied={pixCopied}
          payment={payment}
          status={paymentStatus}
          onBack={() => setPayment(null)}
          onCopy={copyPixCode}
          onReset={resetDonation}
        />
      ) : null}

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
                disabled={isInactive || creatingDonation}
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
            disabled={isInactive || creatingDonation}
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
              disabled={isInactive || creatingDonation}
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
                placeholder="0,00"
                value={formatAmountInput(amountCents)}
                onChange={(event) => setAmountCents(event.target.value.replace(/\D/g, ''))}
                disabled={isInactive || creatingDonation}
              />
            </label>

            <p>Mínimo: {minValue}</p>
          </div>

          {donationError ? <p className="donation-form-error">{donationError}</p> : null}

          <button
            className="donation-submit"
            type="submit"
            disabled={isInactive || creatingDonation}
          >
            {creatingDonation ? <LoaderCircle className="donation-submit__spinner" /> : <Send />}
            {isInactive ? 'Página indisponível' : creatingDonation ? 'Gerando Pix...' : 'Enviar PIX'}
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

