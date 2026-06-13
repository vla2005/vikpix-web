import { useRef, useState } from 'react'
import {
  Bell,
  Copy,
  Download,
  EyeOff,
  Link2,
  MessageSquare,
  Palette,
  QrCode,
} from 'lucide-react'
import DonationQrCode from '@/components/DonationQrCode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MainLayout from '@/layouts/MainLayout'

const widgetTabs = ['QRCode', 'Alerta', 'Metas']
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
        className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${checked ? 'bg-[var(--dashboard-accent)]' : 'bg-[var(--dashboard-hover)]'}`}
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

function WidgetsPage() {
  const qrCodeRef = useRef(null)
  const [primaryColor, setPrimaryColor] = useState(defaultQrColors.primary)
  const [backgroundColor, setBackgroundColor] = useState(defaultQrColors.background)
  const [message, setMessage] = useState('Aponte a câmera do celular')
  const [autoHide, setAutoHide] = useState(false)
  const [showLink, setShowLink] = useState(true)
  const [showMessage, setShowMessage] = useState(true)
  const hasCustomColors =
    primaryColor.toLowerCase() !== defaultQrColors.primary ||
    backgroundColor.toLowerCase() !== defaultQrColors.background

  return (
    <MainLayout>
      {({ user }) => {
        const streamerSlug = getStreamerSlug(user)
        const donationUrl = `${getAppUrl()}/${streamerSlug}`
        const shortUrl = shortenUrl(donationUrl)
        const displayUrl = shortUrl.length <= 28 ? shortUrl : `${shortUrl.slice(0, 25)}...`

        return (
          <section className="h-dvh overflow-hidden bg-[var(--dashboard-surface)] text-[var(--dashboard-text)]">
            <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_314px] max-[1120px]:grid-cols-1">
              <div className="min-h-0 min-w-0 overflow-hidden px-8 py-6 max-[720px]:px-4">
                <header className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--dashboard-heading)]">
                      Widgets
                    </h1>
                  </div>

                  <Button
                    className="h-9 rounded-full border-0 bg-[var(--dashboard-accent)] px-4 text-sm font-bold text-[var(--dashboard-accent-text)] hover:bg-[var(--dashboard-accent-hover)]"
                    type="button"
                  >
                    <Bell className="size-4" />
                    Testar alerta
                  </Button>
                </header>

                <nav className="mb-7 flex gap-6 overflow-x-auto border-b border-[var(--dashboard-border)]" aria-label="Widgets">
                  {widgetTabs.map((tab, index) => (
                    <a
                      className={`relative shrink-0 py-2.5 text-sm font-medium no-underline ${index === 0 ? 'text-[var(--dashboard-text)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[var(--dashboard-accent)]' : 'text-[var(--dashboard-muted)]'}`}
                      href="/widgets"
                      key={tab}
                    >
                      {tab}
                    </a>
                  ))}
                </nav>

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
                      <ColorField label="Cor secundária" value={backgroundColor} onChange={setBackgroundColor} />
                    </div>

                    {hasCustomColors ? (
                      <button
                      className="mt-2 border-0 bg-transparent p-0 text-[11px] font-bold leading-none text-[var(--dashboard-muted)] underline-offset-4 transition hover:text-[var(--dashboard-text)] hover:underline"
                      type="button"
                      onClick={() => {
                        setPrimaryColor(defaultQrColors.primary)
                        setBackgroundColor(defaultQrColors.background)
                      }}
                    >
                      Restaurar cores padrão
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
                </div>
              </div>

              <aside className="flex h-dvh min-h-0 flex-col border-l border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] max-[1120px]:hidden">
                <div className="flex min-h-0 flex-1 flex-col p-5">
                  <h2 className="m-0 text-base font-extrabold text-[var(--dashboard-heading)]">Widget QRCode</h2>
                  <p className="mt-1 mb-5 max-w-[26ch] text-xs leading-relaxed text-[var(--dashboard-muted)]">
                    Permite que seus viewers escaneiem e sejam direcionados para a sua página.
                  </p>

                  <div className="grid min-h-0 flex-1 place-items-center rounded-xl bg-[var(--dashboard-panel)] p-5">
                    <div className="w-[192px] overflow-hidden rounded-lg shadow-[0_22px_48px_var(--dashboard-shadow)]">
                      {showLink ? (
                        <div className="truncate bg-[var(--dashboard-accent)] px-4 py-3 text-center text-xs font-extrabold text-white">
                          {displayUrl}
                        </div>
                      ) : null}

                      <div className="grid place-items-center bg-[var(--qr-background)] p-4" style={{ '--qr-background': backgroundColor }}>
                        <DonationQrCode
                          ref={qrCodeRef}
                          backgroundColor={backgroundColor}
                          className="[&_svg]:block [&_svg]:h-40 [&_svg]:w-40"
                          color={primaryColor}
                          logoUrl={logoUrl}
                          size={160}
                          url={donationUrl}
                        />
                      </div>

                      {showMessage ? (
                        <div className="bg-[var(--dashboard-accent)] px-4 py-3 text-center text-sm font-extrabold leading-snug text-white">
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
                    className="h-11 w-full rounded-full border-0 bg-[var(--dashboard-accent)] text-sm font-bold text-[var(--dashboard-accent-text)] hover:bg-[var(--dashboard-accent-hover)]"
                    type="button"
                    onClick={() => qrCodeRef.current?.downloadPng()}
                  >
                    <Download className="size-4" />
                    Baixar PNG
                  </Button>
                </div>
              </aside>
            </div>
          </section>
        )
      }}
    </MainLayout>
  )
}

export default WidgetsPage
