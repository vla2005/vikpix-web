import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  EyeOff,
  Link2,
  MessageSquare,
  Palette,
  QrCode,
  Save,
  X,
} from 'lucide-react'
import DonationQrCode from '@/components/DonationQrCode'
import AuthToast from '@/components/AuthToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch, parseApiResponse } from '@/lib/api'

const logoUrl = '/logo-sem-fundo.png'
const defaultQrColors = {
  primary: '#1db8ce',
  background: '#ffffff',
}

function getAppUrl() {
  return (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
}

function getStreamerSlug(user) {
  return user?.userName || user?.username || user?.slug || 'viktorlacerda'
}

function shortenUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium text-[var(--dashboard-muted)]">{label}</span>
      <span className="flex h-10 items-center gap-2 rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-input-bg)] px-2">
        <input
          aria-label={label}
          className="size-6 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          className="h-full border-0 bg-transparent px-1 py-0 text-sm font-medium text-[var(--dashboard-text)] shadow-none focus-visible:ring-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}

function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <div className="flex min-h-[74px] items-center justify-between gap-5 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--dashboard-panel-muted)] text-[var(--dashboard-muted)]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <strong className="block text-sm font-extrabold text-[var(--dashboard-text)]">{title}</strong>
          <span className="mt-1 block text-xs text-[var(--dashboard-muted)]">{description}</span>
        </div>
      </div>

      <button
        aria-pressed={checked}
        className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-0 transition ${checked ? 'bg-[var(--dashboard-accent)]' : 'bg-[var(--dashboard-hover)]'}`}
        type="button"
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-1 grid size-5 place-items-center rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}

function normalizeQrCodeConfig(data) {
  const config = data?.widget || data?.qrcode || data || {}

  return {
    primaryColor: config.primaryColor || config.color || defaultQrColors.primary,
    secondaryColor: config.secondaryColor || config.backgroundColor || defaultQrColors.background,
    message: typeof config.message === 'string' ? config.message : 'Aponte a câmera do celular',
    autoHide: typeof config.autoHide === 'boolean' ? config.autoHide : false,
    showLink: typeof config.showLink === 'boolean' ? config.showLink : true,
    showMessage: typeof config.showMessage === 'boolean' ? config.showMessage : true,
    token: config.token || '',
  }
}

function EmbedWidgetModal({ open, url, copied, onClose, onCopy }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => setIsVisible(true))

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  function closeWithTransition() {
    setIsVisible(false)
    window.setTimeout(onClose, 150)
  }

  if (!open) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-black/80 px-4 transition-[opacity,backdrop-filter] duration-200 ease-out ${isVisible ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0 backdrop-blur-0'}`}
    >
      <section
        className={`relative w-[min(512px,calc(100vw-32px))] rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-6 py-6 text-[var(--dashboard-text)] shadow-[0_24px_80px_var(--dashboard-shadow)] transition-[opacity,transform,filter] duration-200 ease-out will-change-transform ${isVisible ? 'translate-y-0 scale-100 opacity-100 blur-0' : 'translate-y-4 scale-95 opacity-0 blur-sm'}`}
      >
        <button
          className="absolute right-4 top-4 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-text)]"
          type="button"
          onClick={closeWithTransition}
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <h2 className="m-0 mb-2 text-xl font-extrabold tracking-[-0.02em] text-[var(--dashboard-heading)]">
          Incorporar Widget
        </h2>
        <p className="m-0 mb-5 text-sm leading-5 text-[var(--dashboard-muted)]">
          Copie a URL abaixo e cole como fonte de navegador no OBS Studio.
        </p>

        <label className="mb-3 block">
          <span className="mb-2 block text-sm font-bold text-[var(--dashboard-text)]">URL do Widget</span>
          <span className="flex h-12 overflow-hidden rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-input-bg)] focus-within:border-[var(--dashboard-accent)] focus-within:shadow-[0_0_0_2px_rgba(37,194,212,0.28)]">
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-3 font-mono text-sm text-[var(--dashboard-text)] outline-none"
              readOnly
              value={url}
              onFocus={(event) => event.target.select()}
            />
            <button
              className="grid h-full w-12 cursor-pointer place-items-center border-l border-[var(--dashboard-border)] bg-transparent text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-text)]"
              type="button"
              onClick={onCopy}
              aria-label="Copiar URL do widget"
            >
              <Copy className="size-4" />
            </button>
          </span>
        </label>

        {copied ? (
          <p className="m-0 mb-3 text-sm font-bold text-[var(--dashboard-accent)]">
            URL copiada.
          </p>
        ) : null}

        <p className="m-0 text-xs leading-5 text-[var(--dashboard-muted)]">
          No OBS, adicione uma fonte "Navegador" e cole esta URL. Defina a largura e altura conforme necessário.
        </p>
      </section>
    </div>
  )
}

function QrCodeTab({ user, header }) {
  const qrCodeRef = useRef(null)
  const [widgetToken, setWidgetToken] = useState('')
  const [primaryColor, setPrimaryColor] = useState(defaultQrColors.primary)
  const [secondaryColor, setSecondaryColor] = useState(defaultQrColors.background)
  const [message, setMessage] = useState('Aponte a câmera do celular')
  const [autoHide, setAutoHide] = useState(false)
  const [showLink, setShowLink] = useState(true)
  const [showMessage, setShowMessage] = useState(true)
  const [embedModalOpen, setEmbedModalOpen] = useState(false)
  const [embedUrlCopied, setEmbedUrlCopied] = useState(false)
  const [initialConfig, setInitialConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const currentConfig = {
    primaryColor,
    secondaryColor,
    message,
    autoHide,
    showLink,
    showMessage,
  }
  const hasUnsavedChanges = initialConfig ? JSON.stringify(currentConfig) !== JSON.stringify(initialConfig) : false
  const hasCustomColors =
    primaryColor.toLowerCase() !== defaultQrColors.primary ||
    secondaryColor.toLowerCase() !== defaultQrColors.background

  useEffect(() => {
    const controller = new AbortController()

    async function loadQrCodeWidget() {
      try {
        const response = await apiFetch('/widgets/qrcode', {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })
        const data = await parseApiResponse(response)

        if (response.ok) {
          const nextConfig = normalizeQrCodeConfig(data)

          setPrimaryColor(nextConfig.primaryColor)
          setSecondaryColor(nextConfig.secondaryColor)
          setMessage(nextConfig.message)
          setAutoHide(nextConfig.autoHide)
          setShowLink(nextConfig.showLink)
          setShowMessage(nextConfig.showMessage)
          setWidgetToken(nextConfig.token)
          setInitialConfig({
            primaryColor: nextConfig.primaryColor,
            secondaryColor: nextConfig.secondaryColor,
            message: nextConfig.message,
            autoHide: nextConfig.autoHide,
            showLink: nextConfig.showLink,
            showMessage: nextConfig.showMessage,
          })
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Não foi possível carregar o widget de QRCode.')
        }
      }
    }

    loadQrCodeWidget()

    return () => controller.abort()
  }, [])

  const streamerSlug = getStreamerSlug(user)
  const donationUrl = `${getAppUrl()}/${streamerSlug}`
  const embedUrl = widgetToken ? `${getAppUrl()}/embed/${widgetToken}` : ''
  const shortUrl = shortenUrl(donationUrl)
  const displayUrl = shortUrl.length <= 28 ? shortUrl : `${shortUrl.slice(0, 25)}...`

  async function copyEmbedUrl() {
    if (!embedUrl) {
      return
    }

    await navigator.clipboard?.writeText(embedUrl)
    setEmbedUrlCopied(true)
    window.setTimeout(() => setEmbedUrlCopied(false), 2000)
  }
  function showToast(type, title, message) {
    setToast({ type, title, message })
    window.setTimeout(() => setToast(null), 2000)
  }

  async function saveQrCodeWidget() {
    if (!hasUnsavedChanges || saving) {
      return
    }

    setSaving(true)

    try {
      const response = await apiFetch('/widgets/qrcode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(currentConfig),
      })

      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error('save-failed')
      }

      const savedConfig = normalizeQrCodeConfig(data || currentConfig)

      if (savedConfig.token) {
        setWidgetToken(savedConfig.token)
      }

      setInitialConfig({ ...currentConfig })
      showToast('success', 'Widget salvo', 'Suas alterações foram salvas.')
    } catch {
      showToast('error', 'Erro ao salvar', 'Não foi possível salvar o widget.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative grid h-full min-h-0 grid-cols-[minmax(0,1fr)_320px] max-[1120px]:grid-cols-1">
      <AuthToast type={toast?.type} title={toast?.title} message={toast?.message} />
      <EmbedWidgetModal
        copied={embedUrlCopied}
        open={embedModalOpen}
        url={embedUrl}
        onClose={() => setEmbedModalOpen(false)}
        onCopy={copyEmbedUrl}
      />

      <div className="min-h-0 min-w-0 overflow-hidden">
        {header}

        <div className="px-8 pb-6 max-[720px]:px-4">
        {hasUnsavedChanges ? (
          <div className="pointer-events-none absolute right-[344px] top-6 z-10 flex items-center gap-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-3 py-2 text-xs font-bold text-[var(--dashboard-text)] shadow-[0_14px_44px_var(--dashboard-shadow)] max-[1120px]:right-8 max-[720px]:right-4">
            <span className="size-2 rounded-full bg-[var(--dashboard-accent)]" />
            Alterações não salvas
          </div>
        ) : null}

        <div className="mb-4 flex items-center gap-2">
          <QrCode className="size-4 text-[var(--dashboard-accent)]" />
          <h2 className="m-0 text-base font-extrabold text-[var(--dashboard-text)]">
            Configurações do QR Code
          </h2>
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--dashboard-panel-muted)] text-[var(--dashboard-muted)]">
                <Palette className="size-5" />
              </span>
              <div>
                <strong className="block text-sm font-extrabold text-[var(--dashboard-text)]">
                  Personalizar cores do widget
                </strong>
                <span className="mt-1 block text-xs text-[var(--dashboard-muted)]">
                  Adapte as cores para combinar com a sua identidade visual.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
              <ColorField label="Cor principal" value={primaryColor} onChange={setPrimaryColor} />
              <ColorField label="Cor secundÃ¡ria" value={secondaryColor} onChange={setSecondaryColor} />
            </div>

            {hasCustomColors ? (
              <button
                className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[11px] font-bold leading-none text-[var(--dashboard-muted)] underline-offset-4 transition hover:text-[var(--dashboard-text)] hover:underline"
                type="button"
                onClick={() => {
                  setPrimaryColor(defaultQrColors.primary)
                  setSecondaryColor(defaultQrColors.background)
                }}
              >
                Restaurar cores padrÃ£o
              </button>
            ) : null}
          </div>

          <ToggleRow
            checked={autoHide}
            description="Esconde o QR Code após o intervalo definido"
            icon={EyeOff}
            title="Ocultar automaticamente"
            onChange={setAutoHide}
          />

          <ToggleRow
            checked={showLink}
            description="Mostra o link da página de doação"
            icon={Link2}
            title="Exibir link"
            onChange={setShowLink}
          />

          <ToggleRow
            checked={showMessage}
            description="Mostra a mensagem customizada"
            icon={MessageSquare}
            title="Exibir mensagem"
            onChange={setShowMessage}
          />

          <label className="grid gap-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4">
            <span className="text-sm font-extrabold text-[var(--dashboard-text)]">Mensagem customizada</span>
            <Input
              className="h-11 rounded-lg border-[var(--dashboard-border)] bg-[var(--dashboard-input-bg)] px-4 text-sm font-medium text-[var(--dashboard-text)] shadow-none focus-visible:border-[var(--dashboard-accent)] focus-visible:ring-2 focus-visible:ring-cyan-400/20"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <div className="flex justify-end pt-1">
            <Button
              className="h-11 min-w-36 cursor-pointer rounded-full border-0 bg-[var(--dashboard-accent)] px-6 text-sm font-bold text-[var(--dashboard-accent-text)] hover:bg-[var(--dashboard-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!hasUnsavedChanges || saving}
              onClick={saveQrCodeWidget}
            >
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
        </div>
      </div>

      <aside className="flex h-full min-h-0 flex-col border-l border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] max-[1120px]:hidden">
        <div className="flex min-h-0 flex-1 flex-col p-5">
          <h2 className="m-0 text-base font-extrabold text-[var(--dashboard-heading)]">Widget QRCode</h2>
          <p className="mt-1 mb-5 max-w-[26ch] text-xs leading-relaxed text-[var(--dashboard-muted)]">
            Permite que seus viewers escaneiem e sejam direcionados para a sua página.
          </p>

          <div className="grid min-h-0 flex-1 place-items-center rounded-xl bg-[var(--dashboard-panel)] p-5">
            <div className="w-[192px] overflow-hidden rounded-lg shadow-[0_22px_48px_var(--dashboard-shadow)]">
              {showLink ? (
                <div
                  className="truncate bg-[var(--qr-primary)] px-4 py-3 text-center text-xs font-extrabold text-white"
                  style={{ '--qr-primary': primaryColor }}
                >
                  {displayUrl}
                </div>
              ) : null}

              <div className="grid place-items-center bg-[var(--qr-background)] p-4" style={{ '--qr-background': secondaryColor }}>
                <DonationQrCode
                  ref={qrCodeRef}
                  backgroundColor={secondaryColor}
                  className="[&_svg]:block [&_svg]:h-40 [&_svg]:w-40"
                  color={primaryColor}
                  logoUrl={logoUrl}
                  size={160}
                  url={donationUrl}
                />
              </div>

              {showMessage ? (
                <div
                  className="bg-[var(--qr-primary)] px-4 py-3 text-center text-sm font-extrabold leading-snug text-white"
                  style={{ '--qr-primary': primaryColor }}
                >
                  {message}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--dashboard-border)] p-5">
          <p className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--dashboard-muted)]">
            <Copy className="mt-0.5 size-4 shrink-0" />
            Precisa de ajuda? Saiba como incorporar o widget.
          </p>

          <Button
            className="h-11 w-full cursor-pointer rounded-full border-0 bg-[var(--dashboard-accent)] text-sm font-bold text-[var(--dashboard-accent-text)] hover:bg-[var(--dashboard-accent-hover)]"
            type="button"
            disabled={!embedUrl}
            onClick={() => setEmbedModalOpen(true)}
          >
            <Copy className="size-4" />
            Incorporar Widget
          </Button>
        </div>
      </aside>
    </div>
  )
}

export default QrCodeTab









