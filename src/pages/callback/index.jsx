import { useEffect, useState } from 'react'
import { handleAuthorizationCallback } from '@/lib/keycloak'
import { navigate } from '@/lib/navigation'

function CallbackPage() {
  const [error, setError] = useState('')

  useEffect(() => {
    async function authenticate() {
      try {
        await handleAuthorizationCallback()
        navigate('/dashboard')
      } catch (error) {
        setError(error.message || 'Erro ao finalizar login.')
      }
    }

    authenticate()
  }, [])

  if (error) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#0b0d0e] px-4 text-center text-[#f4f4f4]">
        <div>
          <h1 className="m-0 text-2xl font-extrabold">Nao foi possivel entrar</h1>
          <p className="mt-2 mb-6 text-sm text-[#8c9298]">{error}</p>
          <a className="text-sm font-bold underline underline-offset-4" href="/login">
            Voltar para login
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0d0e] text-sm font-bold text-[#f4f4f4]">
      Entrando...
    </main>
  )
}

export default CallbackPage
