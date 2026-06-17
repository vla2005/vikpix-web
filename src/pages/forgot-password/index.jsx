import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthBackground from '@/components/AuthBackground'
import AuthToast from '@/components/AuthToast'

function ForgotPasswordPage() {
    const API_URL = import.meta.env.VITE_AUTH_API_URL

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [emailSent, setEmailSent] = useState(false)

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

    async function forgotPassword({ email }) {
        const response = await fetch(`${API_URL}/auth/request-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

        if (!response.ok) {
            throw new Error('Não foi possível enviar o link de redefinição.')
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
        const email = formData.get('email')

        try {
            await forgotPassword({ email })

            form.reset()
            setEmailSent(true)
            setSuccess('Enviamos seu link de redefinição de senha por e-mail.')
        } catch (error) {
            console.error(error)

            if (error instanceof TypeError) {
                setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
                return
            }

            setError('Erro ao enviar o link de redefinição.')
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

            <AuthToast
                type={error ? 'error' : 'success'}
                title={error ? 'Não foi possível enviar' : 'Link enviado'}
                message={error || success}
            />

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
                            Esqueceu sua senha?
                        </h1>

                        <p className="mt-3 text-base font-medium leading-relaxed text-[#777777]">
                            Digite seu e-mail para receber o link de redefinição.
                        </p>

                        {emailSent && (
                            <p className="mt-3 text-base font-medium leading-relaxed text-green-400">
                                Enviamos seu link de redefinição de senha por e-mail!
                            </p>
                        )}
                    </header>

                    <Label className="block">
                        <span className="mb-2 block text-sm font-bold text-[#d6d6d6]">
                            E-mail
                        </span>

                        <Input
                            name="email"
                            autoFocus
                            required
                            type="email"
                            placeholder="email@example.com"
                            className="h-12 rounded-[9px] border border-white/[0.06] bg-[#141414] px-4 text-sm font-medium text-white shadow-none placeholder:text-[#686868] focus-visible:border-[#27b8c9]/70 focus-visible:ring-2 focus-visible:ring-[#27b8c9]/20"
                        />
                    </Label>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-7 h-[50px] w-full rounded-full bg-[#29b8ca] text-sm font-semibold text-[#071315] shadow-[0_16px_35px_rgba(41,184,202,0.22)] transition hover:bg-[#31c8db] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                    </Button>

                    <p className="mt-7 text-center text-sm font-medium text-[#707070]">
                        Ou volte para{' '}
                        <a
                            href="/login"
                            className="font-bold text-[#d6d6d6] underline underline-offset-4 transition hover:text-white"
                        >
                            entrar
                        </a>
                    </p>
                </form>
            </section>
        </main>
    )
}

export default ForgotPasswordPage
