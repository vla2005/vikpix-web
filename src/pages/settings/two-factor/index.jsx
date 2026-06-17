import { useEffect, useState } from 'react'
import { Copy, Eye, LockKeyhole, RefreshCcw, ScanLine, Shield, ShieldCheck, ShieldOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AuthToast from '@/components/AuthToast'
import { apiFetch, parseApiResponse } from '@/lib/api'
import { getTwoFactorEnabled } from '../shared-data'
import { SettingsShell } from '../shared'

function normalizeSetupData(data) {
  return {
    qrCode: data?.qrCode || data?.qrCodeUrl || data?.qrCodeBase64 || data?.qr || '',
    secret: data?.secret || data?.manualCode || data?.otpSecret || '',
  }
}

function normalizeRecoveryCodes(data) {
  if (Array.isArray(data)) {
    return data
  }

  return data?.codes || data?.recoveryCodes || []
}

function TwoFactorIconBadge() {
  return (
    <div className="mx-auto grid size-[54px] place-items-center rounded-full border border-white/10 bg-[#202020] shadow-[inset_0_0_0_6px_rgba(255,255,255,0.035)]">
      <ScanLine className="size-6 text-[#d7dbde]" strokeWidth={1.7} />
    </div>
  )
}

function TwoFactorSetupModal({ open, qrCode, secret, loading, onClose, onContinue }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 px-4 backdrop-blur-[2px]">
      <section className="relative w-[min(448px,calc(100vw-32px))] rounded-lg border border-white/12 bg-[#121212] px-6 py-6 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <button
          className="absolute right-4 top-4 grid size-7 place-items-center rounded-full border-0 bg-transparent text-[#9aa0a6] transition hover:text-white"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <TwoFactorIconBadge />

        <h2 className="mb-2 mt-8 text-[20px] font-extrabold tracking-[-0.025em] text-[#e9ecef]">
          Ativar autenticação em dois fatores
        </h2>
        <p className="mx-auto mb-5 max-w-[360px] text-sm leading-5 text-[#8d9399]">
          Para concluir a ativação da autenticação em dois fatores, escaneie o QR Code ou informe a chave de configuração no seu aplicativo autenticador.
        </p>

        <div className="mx-auto mb-5 grid size-[256px] place-items-center rounded-lg border border-white/12 bg-[#151515]">
          <div className="grid size-[214px] place-items-center overflow-hidden rounded-lg bg-white p-2">
            {qrCode ? (
              <img className="size-full object-contain" src={qrCode} alt="QR Code de autenticação em dois fatores" />
            ) : (
              <ScanLine className="size-16 text-[#111]" strokeWidth={1.6} />
            )}
          </div>
        </div>

        <Button
          className="mb-5 h-11 w-full cursor-pointer rounded-full border-0 bg-[#28b9ca] px-4 text-sm font-medium text-[#071315] shadow-none hover:bg-[#28b9ca] hover:brightness-105"
          type="button"
          disabled={loading}
          onClick={onContinue}
        >
          {loading ? 'Carregando...' : 'Continuar'}
        </Button>

        <div className="relative mb-5 flex items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <span className="relative bg-[#121212] px-2 text-sm font-bold text-[#e5e7eb]">
            ou insira o código manualmente
          </span>
        </div>

        <div className="flex h-11 items-center overflow-hidden rounded-lg border border-white/12 bg-[#101010] text-left">
          <span className="min-w-0 flex-1 truncate px-3 text-sm text-[#e5e7eb]">
            {secret || 'A chave será exibida aqui'}
          </span>
          <button
            className="grid h-full w-11 cursor-pointer place-items-center border-l border-white/10 bg-transparent text-[#c9cdd1] transition hover:text-white"
            type="button"
            onClick={() => secret && navigator.clipboard?.writeText(secret)}
            aria-label="Copiar código manual"
          >
            <Copy className="size-4" />
          </button>
        </div>
      </section>
    </div>
  )
}

function TwoFactorVerifyModal({ open, code, loading, onBack, onClose, onCodeChange, onConfirm }) {
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

        <TwoFactorIconBadge />

        <h2 className="mb-2 mt-10 text-[20px] font-extrabold tracking-[-0.025em] text-[#e9ecef]">
          Verifique o código de autenticação
        </h2>
        <p className="mb-7 text-sm text-[#8d9399]">
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </p>

        <input
          className="mx-auto mb-5 h-9 w-[216px] rounded-lg border border-white/10 bg-[#101010] px-3 text-center font-mono text-lg tracking-[0.62em] text-white shadow-none focus:border-[#25c2d4] focus:shadow-[0_0_0_2px_rgba(37,194,212,0.35)] focus:outline-none"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
          autoFocus
        />

        <div className="flex justify-center gap-5">
          <Button
            className="h-11 min-w-[98px] cursor-pointer rounded-full border border-white/10 bg-[#1b1b1b] px-7 text-sm font-bold text-[#d9dcdf] shadow-none hover:bg-[#232323]"
            type="button"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            className="h-11 min-w-[98px] cursor-pointer rounded-full border-0 bg-[#167c89] px-7 text-sm font-medium text-[#071315] shadow-none hover:bg-[#28b9ca] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={loading || code.length !== 6}
            onClick={onConfirm}
          >
            {loading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </div>
      </section>
    </div>
  )
}

function RecoveryCodesModal({ open, codes, loading, onClose, onRegenerate }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timer = window.setTimeout(() => setCopied(false), 2000)

    return () => window.clearTimeout(timer)
  }, [copied])

  if (!open) {
    return null
  }

  async function copyCodes() {
    if (!codes?.length) {
      return
    }

    await navigator.clipboard?.writeText(codes.join('\n'))
    setCopied(true)
  }

  function closeModal() {
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/82 px-4 backdrop-blur-[2px]">
      <section className="relative w-[min(520px,calc(100vw-32px))] rounded-lg border border-white/12 bg-[#121212] px-6 py-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <button
          className="absolute right-4 top-4 grid size-7 place-items-center rounded-full border-0 bg-transparent text-[#9aa0a6] transition hover:text-white"
          type="button"
          onClick={closeModal}
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#202020]">
            <LockKeyhole className="size-5 text-[#d7dbde]" />
          </span>
          <div>
            <h2 className="m-0 text-lg font-extrabold tracking-[-0.02em] text-[#f2f4f5]">
              Códigos de recuperação
            </h2>
            <p className="m-0 text-sm text-[#8d9399]">
              Estes códigos serão exibidos uma única vez. Guarde-os em um local seguro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-[#101010] p-3 max-[520px]:grid-cols-1">
          {codes.map((code) => (
            <code className="rounded-md bg-[#181818] px-3 py-2 text-sm font-bold text-[#e6eaed]" key={code}>
              {code}
            </code>
          ))}
        </div>

        <Button
          className="mt-5 cursor-pointer rounded-full border-0 bg-[#28b9ca] px-5 text-sm font-medium text-[#071315] shadow-none hover:bg-[#28b9ca] hover:brightness-105"
          type="button"
          onClick={copyCodes}
        >
          <Copy className="mr-2 size-4" />
          Copiar códigos
        </Button>

        <Button
          className="ml-3 mt-5 cursor-pointer rounded-full border border-white/10 bg-[#1b1b1b] px-5 text-sm font-bold text-[#d9dcdf] shadow-none hover:bg-[#232323] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={loading}
          onClick={onRegenerate}
        >
          <RefreshCcw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Gerando...' : 'Regenerar novos códigos'}
        </Button>

        {copied ? (
          <p className="mt-3 text-sm font-medium text-[#28b9ca]">
            Códigos copiados para a área de transferência.
          </p>
        ) : null}
      </section>
    </div>
  )
}

function DisableTwoFactorModal({ open, code, loading, onClose, onCodeChange, onConfirm }) {
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

        <div className="mx-auto grid size-[54px] place-items-center rounded-full border border-white/10 bg-[#202020]">
          <ShieldOff className="size-6 text-[#d7dbde]" strokeWidth={1.7} />
        </div>

        <h2 className="mb-2 mt-8 text-[20px] font-extrabold tracking-[-0.025em] text-[#e9ecef]">
          Desativar autenticação em dois fatores
        </h2>
        <p className="mx-auto mb-6 max-w-[360px] text-sm leading-5 text-[#8d9399]">
          Informe um código do aplicativo autenticador ou um código de recuperação para confirmar.
        </p>

        <input
          className="mb-5 h-11 rounded-lg border border-white/10 bg-[#101010] px-4 text-center font-mono text-sm tracking-[0.12em] text-white shadow-none focus:border-[#25c2d4] focus:shadow-[0_0_0_2px_rgba(37,194,212,0.35)] focus:outline-none"
          value={code}
          onChange={(event) => onCodeChange(event.target.value.trim())}
          placeholder="123456 ou AAAA-BBBB-CCCC"
          autoFocus
        />

        <div className="flex justify-center gap-4">
          <Button
            className="h-11 min-w-[98px] cursor-pointer rounded-full border border-white/10 bg-[#1b1b1b] px-7 text-sm font-bold text-[#d9dcdf] shadow-none hover:bg-[#232323]"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="h-11 min-w-[120px] cursor-pointer rounded-full border-0 bg-[#bd3d3d] px-7 text-sm font-bold text-white shadow-none hover:bg-[#bd3d3d] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={loading || !code}
            onClick={onConfirm}
          >
            {loading ? 'Desativando...' : 'Desativar'}
          </Button>
        </div>
      </section>
    </div>
  )
}

function TwoFactorSettingsPage() {
  const [toast, setToast] = useState(null)
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [setupData, setSetupData] = useState({ qrCode: '', secret: '' })
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [twoFactorStatus, setTwoFactorStatus] = useState(null)
  const [twoFactorActivated, setTwoFactorActivated] = useState(false)
  const [twoFactorDisabled, setTwoFactorDisabled] = useState(false)
  const [loading, setLoading] = useState(false)

  function showToast(type, title, message) {
    setToast({ type, title, message })
    window.setTimeout(() => setToast(null), 2000)
  }

  useEffect(() => {
    let active = true

    async function loadStatus() {
      try {
        const response = await apiFetch('/auth/2fa/status', {
          headers: {
            Accept: 'application/json',
          },
        })
        const data = await parseApiResponse(response)

        if (active && response.ok) {
          setTwoFactorStatus(Boolean(data?.enabled))
          setTwoFactorActivated(Boolean(data?.enabled))
          setTwoFactorDisabled(!data?.enabled)
        }
      } catch {
        if (active) {
          setTwoFactorStatus(null)
        }
      }
    }

    loadStatus()

    return () => {
      active = false
    }
  }, [])

  async function beginTwoFactorSetup() {
    setLoading(true)

    try {
      const response = await apiFetch('/auth/2fa/setup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error('setup-failed')
      }

      setSetupData(normalizeSetupData(data))
      setSetupModalOpen(true)
    } catch {
      showToast('error', 'Erro no 2FA', 'Não foi possível iniciar a configuração do 2FA.')
    } finally {
      setLoading(false)
    }
  }

  async function activateTwoFactor() {
    setLoading(true)

    try {
      const response = await apiFetch('/auth/2fa/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      })
      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error('activate-failed')
      }

      setRecoveryCodes(normalizeRecoveryCodes(data))
      setVerifyModalOpen(false)
      setSetupModalOpen(false)
      setRecoveryModalOpen(true)
      setVerificationCode('')
      setTwoFactorStatus(true)
      setTwoFactorActivated(true)
      setTwoFactorDisabled(false)
      showToast('success', '2FA ativado', 'A autenticação em dois fatores foi ativada.')
      window.dispatchEvent(new CustomEvent('vikpix:two-factor-enabled'))
    } catch {
      showToast('error', 'Erro no 2FA', 'Não foi possível ativar o 2FA.')
    } finally {
      setLoading(false)
    }
  }

  async function regenerateRecoveryCodes() {
    setLoading(true)

    try {
      const response = await apiFetch('/auth/2fa/recovery-codes/regenerate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error('recovery-codes-failed')
      }

      setRecoveryCodes(normalizeRecoveryCodes(data))
      setRecoveryModalOpen(true)
    } catch {
      showToast('error', 'Erro no 2FA', 'Não foi possível gerar novos códigos de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  async function showRecoveryCodes() {
    if (recoveryCodes.length) {
      setRecoveryModalOpen(true)
      return
    }

    await regenerateRecoveryCodes()
  }

  async function disableTwoFactor() {
    setLoading(true)

    try {
      const response = await apiFetch('/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ code: disableCode }),
      })

      if (!response.ok) {
        throw new Error('disable-failed')
      }

      setTwoFactorStatus(false)
      setTwoFactorDisabled(true)
      setTwoFactorActivated(false)
      setRecoveryCodes([])
      setDisableCode('')
      setDisableModalOpen(false)
      showToast('success', '2FA desativado', 'A autenticação em dois fatores foi desativada.')
    } catch {
      showToast('error', 'Erro no 2FA', 'Não foi possível desativar o 2FA.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsShell
      activeLabel="2FA"
      toast={<AuthToast type={toast?.type} title={toast?.title} message={toast?.message} />}
    >
      {({ user }) => {
        const userTwoFactorEnabled = getTwoFactorEnabled(user)
        const twoFactorEnabled = ((twoFactorStatus ?? userTwoFactorEnabled) || twoFactorActivated) && !twoFactorDisabled

        return (
          <>
            <TwoFactorSetupModal
              open={setupModalOpen}
              qrCode={setupData.qrCode}
              secret={setupData.secret}
              loading={loading}
              onClose={() => setSetupModalOpen(false)}
              onContinue={() => {
                setSetupModalOpen(false)
                setVerifyModalOpen(true)
              }}
            />

            <TwoFactorVerifyModal
              open={verifyModalOpen}
              code={verificationCode}
              loading={loading}
              onBack={() => {
                setVerifyModalOpen(false)
                setSetupModalOpen(true)
              }}
              onClose={() => setVerifyModalOpen(false)}
              onCodeChange={setVerificationCode}
              onConfirm={activateTwoFactor}
            />

            <RecoveryCodesModal
              open={recoveryModalOpen}
              codes={recoveryCodes}
              loading={loading}
              onClose={() => setRecoveryModalOpen(false)}
              onRegenerate={regenerateRecoveryCodes}
            />

            <DisableTwoFactorModal
              open={disableModalOpen}
              code={disableCode}
              loading={loading}
              onClose={() => setDisableModalOpen(false)}
              onCodeChange={setDisableCode}
              onConfirm={disableTwoFactor}
            />

            <section className="min-w-0">
              <div className="mb-5">
                <h2 className="mt-0 mb-1.5 text-base font-extrabold text-[#f4f4f4]">
                  Autenticação em dois fatores
                </h2>
                <p className="m-0 text-sm text-[#8c9298]">
                  Gerencie as configurações da autenticação em dois fatores
                </p>
              </div>

              <span className={`mb-5 inline-flex h-[22px] items-center rounded-full px-3 text-xs font-extrabold text-white ${twoFactorEnabled ? 'bg-[#24b8ca]' : 'bg-[#b73e3e]'}`}>
                {twoFactorEnabled ? 'Ativada' : 'Desativada'}
              </span>

              {twoFactorEnabled ? (
                <>
                  <p className="m-0 mb-5 max-w-[560px] text-base leading-7 text-[#8c9298]">
                    Com a autenticação em dois fatores ativada, você precisará informar um código seguro no login, que poderá ser obtido no aplicativo autenticador do seu celular.
                  </p>

                  <div className="mb-4 rounded-lg border border-white/10 bg-[#171717] p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <LockKeyhole className="size-4 text-[#d7dbde]" />
                      <h3 className="m-0 text-base font-extrabold text-[#f4f4f4]">
                        Códigos de recuperação do 2FA
                      </h3>
                    </div>
                    <p className="m-0 mb-6 max-w-[500px] text-sm leading-5 text-[#8c9298]">
                      Os códigos de recuperação permitem recuperar o acesso à sua conta caso você perca o dispositivo do 2FA. Guarde-os em um gerenciador de senhas seguro.
                    </p>
                    <Button
                      className="h-11 cursor-pointer rounded-full border-0 bg-[#27b8c9] px-4 py-0 text-sm font-medium text-[#071315] shadow-none hover:bg-[#27b8c9] hover:brightness-105 disabled:cursor-not-allowed"
                      type="button"
                      disabled={loading}
                      onClick={showRecoveryCodes}
                    >
                      <Eye className="mr-2 size-4" />
                      Visualizar códigos de recuperação
                    </Button>
                  </div>

                  <Button
                    className="h-11 cursor-pointer rounded-full border-0 bg-[#bd3d3d] px-4 py-0 text-sm font-bold text-white shadow-none hover:bg-[#bd3d3d] hover:brightness-105 disabled:cursor-not-allowed"
                    type="button"
                    disabled={loading}
                    onClick={() => setDisableModalOpen(true)}
                  >
                    <ShieldOff className="mr-2 size-4" />
                    Desativar 2FA
                  </Button>
                </>
              ) : (
                <>
                  <p className="m-0 mb-5 max-w-[560px] text-base leading-7 text-[#8c9298]">
                    Ao ativar a autenticação em dois fatores, você precisará informar um código seguro durante o login. Esse código pode ser obtido em um aplicativo autenticador no seu celular.
                  </p>

                  <Button
                    className="h-11 cursor-pointer rounded-full border-0 bg-[#27b8c9] px-4 py-0 text-sm font-medium text-[#071315] shadow-none hover:bg-[#27b8c9] hover:brightness-105 disabled:cursor-not-allowed"
                    type="button"
                    disabled={loading}
                    onClick={beginTwoFactorSetup}
                  >
                    {loading ? (
                      <ShieldCheck className="mr-2 size-4" />
                    ) : (
                      <Shield className="mr-2 size-4" />
                    )}
                    Continuar configuração
                  </Button>
                </>
              )}
            </section>
          </>
        )
      }}
    </SettingsShell>
  )
}

export default TwoFactorSettingsPage
