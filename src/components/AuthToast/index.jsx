import { AlertCircle, CheckCircle2 } from 'lucide-react'
import './style.css'

function AuthToast({ type = 'success', title, message }) {
  if (!message) {
    return null
  }

  const isError = type === 'error'

  return (
    <div
      className={`auth-toast ${isError ? 'auth-toast-error' : 'auth-toast-success'}`}
      role="status"
      aria-live="polite"
    >
      {isError ? <AlertCircle /> : <CheckCircle2 />}
      <div>
        <strong>{title}</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}

export default AuthToast
