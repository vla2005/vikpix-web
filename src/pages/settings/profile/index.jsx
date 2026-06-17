import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  editableInputClass,
  getUserValue,
  readonlyInputClass,
} from '../shared-data'
import { SettingsShell } from '../shared'

function ProfileSettingsPage() {
  return (
    <SettingsShell activeLabel="Perfil">
      {({ user }) => {
        const userName = getUserValue(user, ['userName', 'username'])
        const name = getUserValue(user, ['name', 'fullName'])
        const email = getUserValue(user, ['email'])
        const cpf = getUserValue(user, ['cpf', 'document', 'documentNumber'])
        const phone = getUserValue(user, ['phone', 'phoneNumber', 'cellphone', 'cellPhone'])

        return (
          <form className="min-w-0">
            <div className="mb-7">
              <h2 className="mt-0 mb-1.5 text-base font-extrabold text-[#f4f4f4]">
                Informações do perfil
              </h2>
              <p className="m-0 text-sm text-[#8c9298]">
                Atualize username, nome e e-mail. CPF e celular são exibidos apenas para consulta.
              </p>
            </div>

            <Label className="mt-0 mb-[22px] block">
              <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Username</span>
              <Input className={editableInputClass} name="userName" defaultValue={userName} />
            </Label>

            <Label className="mt-0 mb-[22px] block">
              <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Nome</span>
              <Input className={editableInputClass} name="name" defaultValue={name} />
            </Label>

            <Label className="mt-0 mb-[22px] block">
              <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">E-mail</span>
              <Input className={editableInputClass} name="email" defaultValue={email} type="email" />
            </Label>

            <Label className="mt-0 mb-[22px] block">
              <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">CPF</span>
              <Input className={readonlyInputClass} name="cpf" defaultValue={cpf} readOnly />
            </Label>

            <Label className="mt-0 mb-[22px] block">
              <span className="mb-2 block text-sm font-bold text-[#f4f4f4]">Celular</span>
              <Input className={readonlyInputClass} name="phone" defaultValue={phone} readOnly />
            </Label>

            <Button
              className="mt-0 h-11 cursor-pointer rounded-full border-0 bg-[#27b8c9] px-4 py-0 text-sm font-medium text-[#071315] shadow-none hover:bg-[#27b8c9] hover:brightness-105"
              type="button"
            >
              Salvar
            </Button>
          </form>
        )
      }}
    </SettingsShell>
  )
}

export default ProfileSettingsPage
