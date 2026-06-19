import { useEffect, useMemo, useState } from 'react'
import {
  CircleDollarSign,
  ExternalLink,
  EyeOff,
  Mic,
  Palette,
  Save,
  Send,
  UserRound,
} from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import AuthToast from '@/components/AuthToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch, parseApiResponse } from '@/lib/api'

function getInitials(name) {
  if (!name) return 'U'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getAvatarUrl(user) {
  return user?.avatarUrl || user?.picture || user?.avatar || user?.imageUrl || ''
}

function getUserSlug(user) {
  return user?.userName || user?.username || user?.slug || 'viktorlacerdadearaujo'
}

function getUserSlugFromAccount(user) {
  return user?.userName || user?.username || user?.slug || user?.preferred_username || ''
}

function formatCentsToReais(cents) {
  const value = Number(cents || 0) / 100

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseReaisToCents(value) {
  const digits = String(value || '').replace(/\D/g, '')

  return Number(digits || 0)
}

function formatMoneyInput(value) {
  return formatCentsToReais(parseReaisToCents(value))
}

function normalizeDonationPage(data) {
  return {
    userName: data?.userName || '',
    avatarUrl: data?.avatarUrl || '',
    active: typeof data?.active === 'boolean' ? data.active : true,
    mainColor: data?.mainColor || '#3f8fdc',
    minCents: Number.isFinite(Number(data?.minCents)) ? Number(data.minCents) : 300,
  }
}

function ToggleSwitch({ checked, disabled = false, onChange, label }) {
  return (
    <button
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      className={`relative h-8 w-14 shrink-0 rounded-full border-0 transition ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${checked ? 'bg-[var(--dashboard-accent)]' : 'bg-[var(--dashboard-hover)]'}`}
      type="button"
      onClick={() => {
        if (!disabled) {
          onChange(!checked)
        }
      }}
    >
      <span
        className={`absolute top-1 grid size-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  )
}

function FieldCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4">
      <div className="mb-4 flex items-center gap-3">
        {Icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--dashboard-panel-muted)] text-[var(--dashboard-muted)]">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div>
          <h3 className="m-0 text-sm font-extrabold text-[var(--dashboard-text)]">{title}</h3>
          {description ? <p className="m-0 mt-1 text-xs text-[var(--dashboard-muted)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function DonationPreview({ user, mainColor, minCents }) {
  const userName = user?.name || user?.userName || 'Viktor Lacerda de Araujo'
  const avatarUrl = getAvatarUrl(user)
  const initials = getInitials(userName)
  const slug = getUserSlug(user)

  return (
    <div
      className="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--preview-main)_18%,var(--dashboard-border))] bg-[#05070b] p-5"
      style={{ '--preview-main': mainColor }}
    >
      <style>
        {`
          @keyframes donation-preview-grid {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-48px, -48px, 0); }
          }

          @keyframes donation-preview-glow-left {
            0%, 100% { transform: translate3d(-5%, 3%, 0) scale(1); opacity: 0.56; }
            50% { transform: translate3d(6%, -4%, 0) scale(1.12); opacity: 0.82; }
          }

          @keyframes donation-preview-glow-right {
            0%, 100% { transform: translate3d(5%, -3%, 0) scale(1); opacity: 0.48; }
            50% { transform: translate3d(-7%, 5%, 0) scale(1.1); opacity: 0.74; }
          }

          @keyframes donation-preview-beam {
            from { transform: translate3d(-8%, 10%, 0) rotate(-14deg); opacity: 0.35; }
            to { transform: translate3d(10%, -8%, 0) rotate(-14deg); opacity: 0.82; }
          }

          @keyframes donation-preview-logo {
            0%, 100% { transform: rotate(-8deg) scale(0.98); opacity: 0.055; }
            50% { transform: rotate(-8deg) scale(1.04); opacity: 0.09; }
          }

          @media (prefers-reduced-motion: reduce) {
            .donation-preview-grid,
            .donation-preview-glow,
            .donation-preview-beam,
            .donation-preview-logo {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,color-mix(in_srgb,var(--preview-main)_12%,transparent),transparent_34%),linear-gradient(180deg,#07111b_0%,#05070b_46%,#05070b_100%)]" />
      <div
        className="donation-preview-grid absolute inset-[-48px] opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:48px_48px]"
        style={{ animation: 'donation-preview-grid 34s linear infinite' }}
      />
      <div
        className="donation-preview-glow absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--preview-main) 34%, transparent) 0%, color-mix(in srgb, var(--preview-main) 13%, transparent) 46%, transparent 72%)',
          animation: 'donation-preview-glow-left 18s ease-in-out infinite',
        }}
      />
      <div
        className="donation-preview-glow absolute -right-28 top-12 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--preview-main) 22%, #2563ff 10%) 0%, color-mix(in srgb, var(--preview-main) 10%, transparent) 45%, transparent 74%)',
          animation: 'donation-preview-glow-right 22s ease-in-out infinite',
        }}
      />
      <div
        className="donation-preview-beam absolute left-[-28%] top-[64%] h-[3px] w-[144%] rounded-full blur-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--preview-main) 38%, transparent) 38%, color-mix(in srgb, var(--preview-main) 78%, #2563ff 22%) 52%, transparent 76%)',
          boxShadow: '0 0 22px color-mix(in srgb, var(--preview-main) 56%, transparent)',
          animation: 'donation-preview-beam 12s ease-in-out infinite alternate',
        }}
      />
      <img
        className="donation-preview-logo absolute right-[-28%] top-[25%] w-[280px] max-w-none select-none object-contain opacity-[0.07] blur-[1.2px] grayscale invert"
        src="/logo-sem-fundo.png"
        alt=""
        style={{ animation: 'donation-preview-logo 21s ease-in-out infinite' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,11,0.24)_44%,rgba(5,7,11,0.95)_100%)]" />

      <div className="relative z-[1] w-full max-w-[292px]">
        <section className="rounded-2xl border border-[color-mix(in_srgb,var(--preview-main)_22%,rgba(255,255,255,0.17))] bg-[linear-gradient(180deg,rgba(10,17,27,0.88)_0%,rgba(7,11,18,0.93)_100%)] p-4 shadow-[0_28px_72px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
          <header className="mb-4 flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-extrabold text-white shadow-[0_0_0_2px_color-mix(in_srgb,var(--preview-main)_78%,#2563ff_22%),0_0_22px_color-mix(in_srgb,var(--preview-main)_32%,transparent)]">
              {avatarUrl ? <img className="size-full object-cover" src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-extrabold tracking-[-0.03em] text-white">@{slug}</strong>
              <span className="mt-2 block h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22),transparent)]" />
            </div>
          </header>

          <div className="relative mb-3 flex h-11 items-center rounded-xl border border-slate-400/25 bg-[#080d15]/60 px-3 text-xs font-semibold text-slate-300/60">
            Seu nome
            <UserRound className="absolute right-3 size-4 text-slate-300/55" />
          </div>

          <div className="mb-3 flex h-11 items-center justify-between rounded-xl border border-slate-400/25 bg-[#080d15]/60 px-3 text-xs font-extrabold text-white">
            <span className="flex items-center gap-2">
              <EyeOff className="size-4 text-[var(--preview-main)]" />
              Doar de forma anônima
            </span>
            <span className="relative h-5 w-9 rounded-full bg-slate-500/50 p-1">
              <span className="block size-3 rounded-full bg-white" />
            </span>
          </div>

          <div className="relative mb-3 h-20 rounded-xl border border-slate-400/25 bg-[#080d15]/60 px-3 py-3 text-xs font-semibold text-slate-300/60">
            Sua mensagem...
            <Mic className="absolute bottom-3 right-3 size-4 text-slate-300/55" />
          </div>

          <strong className="mb-2 block text-xs font-extrabold text-white">Valor</strong>
          <div className="mb-2 flex h-10 items-center overflow-hidden rounded-xl border border-slate-400/25 bg-[#080d15]/60 text-xs font-extrabold text-white">
            <span className="grid h-full w-12 place-items-center border-r border-slate-400/20">R$</span>
            <span className="px-3 text-slate-300/60">0,00</span>
          </div>
          <p className="m-0 mb-3 text-[11px] font-semibold text-slate-300/60">Mínimo: R$ {minCents || '0,00'}</p>

          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-0 bg-[linear-gradient(100deg,color-mix(in_srgb,var(--preview-main)_88%,white_12%)_0%,color-mix(in_srgb,var(--preview-main)_72%,#2563ff_28%)_52%,#2563ff_100%)] text-sm font-extrabold text-white shadow-[0_16px_34px_color-mix(in_srgb,var(--preview-main)_24%,transparent),inset_0_1px_0_rgba(255,255,255,0.22)]"
            type="button"
          >
            <Send className="size-4" />
            Enviar PIX
          </button>
        </section>

        <p className="mx-auto mt-4 max-w-[260px] text-center text-[10px] font-medium leading-relaxed text-slate-300/60">
          Ao utilizar nosso serviço, você concorda com os nossos <span className="font-bold text-[var(--preview-main)]">Termos de Uso</span>
          <br />e com a nossa <span className="font-bold text-[var(--preview-main)]">Política de Privacidade</span>.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-white">
          <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,color-mix(in_srgb,var(--preview-main)_88%,white_12%),#2563ff)] shadow-[0_0_24px_color-mix(in_srgb,var(--preview-main)_28%,transparent)]">
            <img className="size-6 object-contain brightness-0 invert" src="/logo-sem-fundo.png" alt="" />
          </span>
          <strong className="text-xl font-black tracking-[-0.06em] text-white">VikPix</strong>
        </div>
      </div>
    </div>
  )
}

function DonationPageContent({ user }) {
  const accountUserName = getUserSlugFromAccount(user)
  const [loadedDonationPage, setLoadedDonationPage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [mainColor, setMainColor] = useState('#3f8fdc')
  const [active, setActive] = useState(true)
  const [minCents, setMinCents] = useState('3,00')
  const [initialConfig, setInitialConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingActive, setSavingActive] = useState(false)
  const [toast, setToast] = useState(null)
  const hasCustomColor = mainColor.toLowerCase() !== '#1db8ce'

  useEffect(() => {
    if (!accountUserName) return undefined

    const controller = new AbortController()

    async function loadDonationPage() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await apiFetch(`/donation-page/${encodeURIComponent(accountUserName)}`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        const data = await parseApiResponse(response)

        if (!response.ok) {
          throw new Error('load-failed')
        }

        const normalizedData = normalizeDonationPage(data)

        setLoadedDonationPage(normalizedData)
        setActive(normalizedData.active)
        setMainColor(normalizedData.mainColor)
        setMinCents(formatCentsToReais(normalizedData.minCents))
        setInitialConfig({
          mainColor: normalizedData.mainColor,
          minCents: normalizedData.minCents,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError('Não foi possível carregar as configurações da página.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDonationPage()

    return () => controller.abort()
  }, [accountUserName])

  const currentConfig = {
    mainColor,
    minCents: parseReaisToCents(minCents),
  }
  const hasUnsavedChanges = initialConfig ? JSON.stringify(currentConfig) !== JSON.stringify(initialConfig) : false

  function showToast(type, title, message) {
    setToast({ type, title, message })
    window.setTimeout(() => setToast(null), 2000)
  }

  async function updateDonationPageActive(nextActive) {
    if (savingActive || nextActive === active) {
      return
    }

    setSavingActive(true)

    try {
      const response = await apiFetch(`/donation-page/active/${nextActive}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
        },
      })

      await parseApiResponse(response)

      if (!response.ok) {
        throw new Error('active-update-failed')
      }

      setActive(nextActive)
      showToast('success', nextActive ? 'Página ativada' : 'Página pausada', 'Status atualizado com sucesso.')
    } catch {
      showToast('error', 'Erro ao atualizar', 'Não foi possível alterar o status da página.')
    } finally {
      setSavingActive(false)
    }
  }

  async function saveDonationPage() {
    if (!hasUnsavedChanges || saving) {
      return
    }

    setSaving(true)

    try {
      const response = await apiFetch('/donation-page', {
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

      const savedConfig = {
        mainColor: data?.mainColor || currentConfig.mainColor,
        minCents: Number.isFinite(Number(data?.minCents)) ? Number(data.minCents) : currentConfig.minCents,
      }

      setMainColor(savedConfig.mainColor)
      setMinCents(formatCentsToReais(savedConfig.minCents))
      setLoadedDonationPage((previous) => ({
        ...(previous || {}),
        ...savedConfig,
      }))
      setInitialConfig(savedConfig)
      showToast('success', 'Página salva', 'Suas alterações foram salvas.')
    } catch {
      showToast('error', 'Erro ao salvar', 'Não foi possível salvar a página de doação.')
    } finally {
      setSaving(false)
    }
  }

  const previewUser = {
    ...user,
    userName: loadedDonationPage?.userName || accountUserName || getUserSlug(user),
    avatarUrl: loadedDonationPage?.avatarUrl || getAvatarUrl(user),
  }

  const publicSlug = loadedDonationPage?.userName || accountUserName || getUserSlug(user)
  const publicUrl = useMemo(
    () => `${(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')}/${publicSlug}`,
    [publicSlug],
  )

  return (
    <section className="relative grid h-dvh min-h-0 grid-cols-[minmax(0,1fr)_376px] overflow-hidden bg-[var(--dashboard-surface)] text-[var(--dashboard-text)] max-[1180px]:grid-cols-1">
      <AuthToast type={toast?.type} title={toast?.title} message={toast?.message} />
      {hasUnsavedChanges ? (
        <div className="pointer-events-none absolute right-[400px] top-6 z-10 flex items-center gap-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-3 py-2 text-xs font-bold text-[var(--dashboard-text)] shadow-[0_14px_44px_var(--dashboard-shadow)] max-[1180px]:right-8 max-[720px]:right-4">
          <span className="size-2 rounded-full bg-[var(--dashboard-accent)]" />
          Alterações não salvas
        </div>
      ) : null}

      <div className="scrollbar-none min-h-0 overflow-y-auto px-10 py-7 max-[720px]:px-5">
        <div className="max-w-[760px]">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--dashboard-heading)]">
                Página de Doação
              </h1>
              <p className="m-0 mt-1 text-sm text-[var(--dashboard-muted)]">
                {loading
                  ? 'Carregando configurações da sua página.'
                  : `Sua página está ${active ? 'ativa e recebendo doações.' : 'pausada para novas doações.'}`}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-4 py-2">
              <span className={`size-2.5 rounded-full ${active ? 'bg-[var(--dashboard-accent)]' : 'bg-[#b73e3e]'}`} />
              <strong className="text-sm font-extrabold text-[var(--dashboard-text)]">
                {active ? 'Página ativa' : 'Página pausada'}
              </strong>
              <ToggleSwitch
                checked={active}
                disabled={savingActive}
                label="Alternar página ativa"
                onChange={updateDonationPageActive}
              />
            </div>
          </header>

          {loadError ? (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {loadError}
            </div>
          ) : null}

          <FieldCard
            icon={Palette}
            title="Cor principal"
            description="Usada nos botões de valor e destaques da página"
          >
            <label className="grid gap-2">
              <span className="text-xs text-[var(--dashboard-muted)]">Cor</span>
              <span className="flex h-10 items-center gap-3 rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-input-bg)] px-2">
                <input
                  className="size-6 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                  type="color"
                  value={mainColor.slice(0, 7)}
                  onChange={(event) => setMainColor(event.target.value)}
                  aria-label="Cor principal"
                />
                <Input
                  className="h-full border-0 bg-transparent px-1 py-0 text-sm font-medium text-[var(--dashboard-text)] shadow-none focus-visible:ring-0"
                  value={mainColor}
                  onChange={(event) => setMainColor(event.target.value)}
                />
              </span>
            </label>
            {hasCustomColor ? (
              <button
                className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[11px] font-bold leading-none text-[var(--dashboard-muted)] underline-offset-4 transition hover:text-[var(--dashboard-text)] hover:underline"
                type="button"
                onClick={() => setMainColor('#1db8ce')}
              >
                Restaurar cor padrão
              </button>
            ) : null}
          </FieldCard>

          <h2 className="mb-3 mt-6 text-base font-extrabold text-[var(--dashboard-text)]">Valores</h2>
          <FieldCard
            icon={CircleDollarSign}
            title="Valor mínimo"
            description="Menor valor aceito para doações"
          >
            <label className="grid gap-2">
              <span className="text-xs text-[var(--dashboard-muted)]">Valor em reais</span>
              <span className="flex h-10 items-center rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-input-bg)] px-4 text-sm font-medium text-[var(--dashboard-text)] transition focus-within:border-[var(--dashboard-accent)] focus-within:ring-2 focus-within:ring-cyan-400/20">
                <span className="shrink-0 text-[var(--dashboard-text)]">R$</span>
                <Input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 py-0 text-sm font-medium text-[var(--dashboard-text)] shadow-none focus-visible:ring-0"
                  value={minCents}
                  inputMode="numeric"
                  onChange={(event) => setMinCents(formatMoneyInput(event.target.value))}
                />
              </span>
              <span className="text-xs text-[var(--dashboard-muted)]">Mínimo: R$ {minCents || '0,00'}</span>
            </label>
          </FieldCard>

          <div className="mt-5 flex justify-end">
            <Button
              className="h-11 min-w-36 cursor-pointer rounded-full border-0 bg-[var(--dashboard-accent)] px-6 text-sm font-bold text-[var(--dashboard-accent-text)] hover:bg-[var(--dashboard-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!hasUnsavedChanges || saving}
              onClick={saveDonationPage}
            >
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col border-l border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] max-[1180px]:hidden">
        <div className="flex min-h-0 flex-1 flex-col p-6">
          <h2 className="m-0 text-base font-extrabold text-[var(--dashboard-heading)]">Preview da página</h2>
          <p className="m-0 mt-1 mb-6 text-xs leading-relaxed text-[var(--dashboard-muted)]">
            Visualize como os viewers verão sua página de doação
          </p>
          <DonationPreview user={previewUser} mainColor={mainColor} minCents={minCents} />
        </div>

        <div className="border-t border-[var(--dashboard-border)] p-6">
          <Button
            asChild
            className="h-11 w-full cursor-pointer rounded-full border border-[var(--dashboard-border)] bg-transparent text-sm font-extrabold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-hover)]"
          >
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Visitar página
            </a>
          </Button>
        </div>
      </aside>
    </section>
  )
}

function DonationPage() {
  return (
    <MainLayout>
      {({ user }) => <DonationPageContent user={user} />}
    </MainLayout>
  )
}

export default DonationPage







