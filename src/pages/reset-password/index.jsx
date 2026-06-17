import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { navigate } from '@/lib/navigation'
import AuthBackground from '@/components/AuthBackground'

function ResetPasswordPage() {
    const API_URL = import.meta.env.VITE_AUTH_API_URL
    const token = new URLSearchParams(window.location.search).get('token')

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

    async function resetPassword({ token, newPassword }) {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
        })

        if (!response.ok) {
            throw new Error('Erro ao redefinir senha.')
        }

        return true
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const form = event.currentTarget

        setError('')
        setSuccess('')
        setLoading(true)

        const formData = new FormData(form)
        const newPassword = formData.get('newPassword')
        const confirmPassword = formData.get('confirmPassword')

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.')
            setLoading(false)
            return
        }

        try {
            await resetPassword({ token, newPassword })

            form.reset()
            setSuccess('Senha redefinida com sucesso.')

            window.setTimeout(() => {
                navigate('/login')
            }, 1200)
        } catch {
            setError('Erro ao redefinir senha.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0d0d] px-6 py-10 text-white"
            aria-label="Recuperação de senha VikPix"
        >
            <AuthBackground patternId="auth-forgot-password-grid" />

            {(error || success) && (
                <div
                    className={`fixed top-6 right-6 z-50 flex min-w-[320px] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${error
                            ? 'border-red-500/25 bg-red-950/70 text-red-100'
                            : 'border-cyan-400/25 bg-[#102326]/90 text-cyan-50'
                        }`}
                    role="status"
                    aria-live="polite"
                >
                    {error ? (
                        <AlertCircle className="mt-0.5 size-5 text-red-300" />
                    ) : (
                        <CheckCircle2 className="mt-0.5 size-5 text-cyan-300" />
                    )}

                    <div className="flex flex-col gap-0.5">
                        <strong className="text-sm font-bold">
                            {error ? 'Não foi possível enviar' : 'Link enviado'}
                        </strong>
                        <span className="text-sm text-white/70">{error || success}</span>
                    </div>
                </div>
            )}

            <section className="relative z-10 w-full max-w-[470px]">
                <div className="mb-7 flex items-center gap-2 pl-2">
                    <div
                        className="relative flex size-8 rotate-45 items-center justify-center rounded-[10px] bg-[#e8e8e8]"
                        aria-hidden="true"
                    >
                        <span className="absolute left-[8px] top-[11px] size-[5px] rounded-full bg-[#111]" />
                        <span className="absolute right-[8px] top-[11px] size-[5px] rounded-full bg-[#111]" />
                    </div>

                    <span className="text-sm font-bold tracking-[-0.02em] text-white">
                        VikPix
                    </span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[18px] border border-white/[0.08] bg-[#171717]/95 px-8 py-8 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                >
                    <header className="mb-7">
                        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-[#dcdcdc]">
                            Redefinir senha
                        </h1>

                        <p className="mt-3 text-base font-medium leading-relaxed text-[#777777]">
                            Digite sua nova senha para continuar.
                        </p>
                    </header>

                    <Label className="block">
                        <span className="mb-2 block text-sm font-bold text-[#d6d6d6]">
                            Nova senha
                        </span>

                        <Input
                            name="newPassword"
                            autoFocus
                            required
                            type="password"
                            placeholder="Nova senha"
                            className="h-12 rounded-[9px] border border-white/[0.06] bg-[#141414] px-4 text-sm font-medium text-white shadow-none placeholder:text-[#686868] focus-visible:border-[#27b8c9]/70 focus-visible:ring-2 focus-visible:ring-[#27b8c9]/20"
                        />
                    </Label>

                    <Label className="block mt-4">
                        <span className="mb-2 block text-sm font-bold text-[#d6d6d6]">
                            Confirmar senha
                        </span>

                        <Input
                            name="confirmPassword"
                            autoFocus
                            required
                            type="password"
                            placeholder="Confirmar senha"
                            className="h-12 rounded-[9px] border border-white/[0.06] bg-[#141414] px-4 text-sm font-medium text-white shadow-none placeholder:text-[#686868] focus-visible:border-[#27b8c9]/70 focus-visible:ring-2 focus-visible:ring-[#27b8c9]/20"
                        />
                    </Label>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-7 h-[50px] w-full rounded-full bg-[#29b8ca] text-sm font-semibold text-[#071315] shadow-[0_16px_35px_rgba(41,184,202,0.22)] transition hover:bg-[#31c8db] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Redefinindo...' : 'Redefinir senha'}
                    </Button>
                </form>
            </section>
        </main>
    )
}

export default ResetPasswordPage
