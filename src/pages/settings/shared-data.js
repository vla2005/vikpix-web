export const settingsTabs = [
  { label: 'Perfil', path: '/settings/profile' },
  { label: 'Senha', path: '/settings/password' },
  { label: '2FA', path: '/settings/two-factor' },
]

export const editableInputClass = 'h-11 rounded-lg border-white/10 bg-[#101010] px-4 py-0 text-sm text-white shadow-none transition-[border-color,box-shadow,background] focus:border-[#25c2d4] focus:bg-[#101112] focus:shadow-[0_0_0_2px_rgba(37,194,212,0.35)]'
export const readonlyInputClass = 'h-11 cursor-default rounded-lg border-white/10 bg-[#101010] px-4 py-0 text-sm text-[#777d82] shadow-none'

export function getUserValue(user, keys) {
  return keys.map((key) => user?.[key]).find(Boolean) || ''
}

export function getTwoFactorEnabled(user) {
  return Boolean(user?.twoFactorAuthEnabled || user?.twoFactorEnabled || user?.twoFactorActive || user?.otpEnabled || user?.mfaEnabled)
}
