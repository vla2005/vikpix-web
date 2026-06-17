import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthToast from '@/components/AuthToast'
import { apiFetch } from '@/lib/api'
import { editableInputClass } from '../shared-data'
import { SettingsShell } from '../shared'

function getPasswordValidationErrors(password) {
  const errors = []

  if (password.length < 8) {
    errors.push('pelo menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('1 letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('1 letra minúscula')
  }

  if (!/\d/.test(password)) {
    errors.push('1 número')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('1 caractere especial')
  }

  return errors
}

function getPasswordRequirements(password) {
  return [
    { label: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
    { label: '1 letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: '1 letra minúscula', valid: /[a-z]/.test(password) },
    { label: '1 número', valid: /\d/.test(password) },
    { label: '1 caractere especial', valid: /[^A-Za-z0-9]/.test(password) },
  ]
}

function PasswordSettingsPage() {
  const [toast, setToast] = useState(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [newPasswordValue, setNewPasswordValue] = useState('')

  function showToast(type, title, message) {
    setToast({ type, title, message })
    window.setTimeout(() => setToast(null), 2000)
  }

  async function updatePassword(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const currentPassword = formData.get('currentPassword')?.toString().trim()
    const newPassword = formData.get('newPassword')?.toString().trim()
    const confirmPassword = formData.get('confirmPassword')?.toString().trim()
    setCurrentPasswordError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Campos obrigatórios', 'Preencha todos os campos para atualizar sua senha.')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Senhas diferentes', 'A nova senha e a confirmação precisam ser iguais.')
      return
    }

    const passwordValidationErrors = getPasswordValidationErrors(newPassword)

    if (passwordValidationErrors.length) {
      showToast(
        'error',
        'Senha inválida',
        `A nova senha precisa conter ${passwordValidationErrors.join(', ')}.`
      )
      return
    }

    setPasswordLoading(true)

    try {
      const response = await apiFetch('/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.status === 400) {
        setCurrentPasswordError('Senha atual incorreta.')
        return
      }

      if (!response.ok) {
        throw new Error('password-update-failed')
      }

      form.reset()
      setCurrentPasswordError('')
      setNewPasswordValue('')
      showToast('success', 'Senha atualizada', 'Sua senha foi atualizada com sucesso.')
    } catch {
      showToast('error', 'Erro ao salvar', 'Não foi possível atualizar sua senha.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <SettingsShell
      activeLabel="Senha"
      toast={<AuthToast type={toast?.type} title={toast?.title} message={toast?.message} />}
    >
      {() => (
        <form className="min-w-0" onSubmit={updatePassword}>
          <div className="mb-7">
            <h2 className="mt-0 mb-1.5 text-base font-extrabold text-[#f4f4f4]">
              Atualizar senha
            </h2>
            <p className="m-0 max-w-[560px] text-sm leading-5 text-[#8c9298]">
              Garanta que sua conta esteja usando uma senha longa e aleatória para permanecer segura
            </p>
          </div>

          <Label className="mt-0 mb-[22px] block">
            <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Senha atual</span>
            <Input
              className={`${editableInputClass} ${currentPasswordError ? 'settings-input-error' : ''}`}
              name="currentPassword"
              placeholder="Digite sua senha atual"
              type="password"
              autoComplete="current-password"
              onChange={() => currentPasswordError && setCurrentPasswordError('')}
            />
            {currentPasswordError ? (
              <span className="mt-2 block text-sm font-medium text-red-500">
                {currentPasswordError}
              </span>
            ) : null}
          </Label>

          <Label className="mt-0 mb-[22px] block">
            <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Nova senha</span>
            <Input
              className={editableInputClass}
              name="newPassword"
              placeholder="Digite sua nova senha"
              type="password"
              autoComplete="new-password"
              value={newPasswordValue}
              onChange={(event) => setNewPasswordValue(event.target.value)}
            />
            <ul className="settings-password-requirements" aria-label="Requisitos da nova senha">
              {getPasswordRequirements(newPasswordValue).map((requirement) => (
                <li className={requirement.valid ? 'is-valid' : ''} key={requirement.label}>
                  <span aria-hidden="true">{requirement.valid ? '✓' : '•'}</span>
                  {requirement.label}
                </li>
              ))}
            </ul>
          </Label>

          <Label className="mt-0 mb-[24px] block">
            <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Confirmar nova senha</span>
            <Input
              className={editableInputClass}
              name="confirmPassword"
              placeholder="Confirme sua nova senha"
              type="password"
              autoComplete="new-password"
            />
          </Label>

          <Button
            className="h-11 cursor-pointer rounded-full border-0 bg-[#27b8c9] px-5 py-0 text-sm font-medium text-[#071315] shadow-none hover:bg-[#27b8c9] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Salvando...' : 'Salvar senha'}
          </Button>
        </form>
      )}
    </SettingsShell>
  )
}

export default PasswordSettingsPage
