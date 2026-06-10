import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MainLayout from '@/layouts/MainLayout'

const settingsTabs = [
  'Perfil',
  'Senha',
  'Autenticacao em dois fatores',
]

const editableInputClass = 'h-11 rounded-lg border-white/10 bg-[#101010] px-4 py-0 text-sm text-white shadow-none transition-[border-color,box-shadow,background] focus:border-[#25c2d4] focus:bg-[#101112] focus:shadow-[0_0_0_2px_rgba(37,194,212,0.35)]'
const readonlyInputClass = 'h-11 cursor-default rounded-lg border-white/10 bg-[#101010] px-4 py-0 text-sm text-[#777d82] shadow-none'

function getUserValue(user, keys) {
  return keys.map((key) => user?.[key]).find(Boolean) || ''
}

function SettingsPage() {
  return (
    <MainLayout>
      {({ user }) => {
        const userName = getUserValue(user, ['userName', 'username'])
        const name = getUserValue(user, ['name', 'fullName'])
        const email = getUserValue(user, ['email'])
        const cpf = getUserValue(user, ['cpf', 'document', 'documentNumber'])
        const phone = getUserValue(user, ['phone', 'phoneNumber', 'cellphone', 'cellPhone'])

        return (
          <section className="min-h-[calc(100dvh-16px)] rounded-[10px] bg-[#0f1010] text-[#f4f4f4] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="ml-7 w-[min(860px,calc(100%-56px))] py-6 max-[860px]:mx-auto max-[860px]:w-[min(620px,calc(100%-28px))]">
              <header className="mb-8">
                <h1 className="mt-0 mb-1.5 text-[24px] leading-[1.1] font-extrabold tracking-[-0.025em] text-[#f1f3f4]">
                  Configurações
                </h1>
                <p className="m-0 text-sm text-[#8c9298]">
                  Gerencie seu perfil e as configurações da sua conta
                </p>
              </header>

              <div className="grid grid-cols-[192px_minmax(0,576px)] items-start gap-12 max-[860px]:grid-cols-1 max-[860px]:gap-7">
                <nav
                  aria-label="Configuracoes"
                  className="grid gap-1 max-[860px]:flex max-[860px]:gap-2 max-[860px]:overflow-x-auto"
                >
                  {settingsTabs.map((tab, index) => (
                    <button
                      className={`h-9 rounded-full border-0 bg-transparent px-3 text-left text-sm font-bold text-white max-[860px]:shrink-0 ${index === 0 ? 'bg-[#1d1d1d]' : ''}`}
                      key={tab}
                      type="button"
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <form className="min-w-0">
                  <div className="mb-7">
                    <h2 className="mt-0 mb-1.5 text-base font-extrabold text-[#f4f4f4]">
                      Informacoes do perfil
                    </h2>
                    <p className="m-0 text-sm text-[#8c9298]">
                      Atualize username, nome e e-mail. CPF e celular sao exibidos apenas para consulta.
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
                    className="mt-0 h-11 rounded-full border-0 bg-[#27b8c9] px-4 py-0 text-sm font-medium text-[#071315] shadow-none hover:bg-[#27b8c9] hover:brightness-105"
                    type="button"
                  >
                    Salvar
                  </Button>
                </form>
              </div>
            </div>
          </section>
        )
      }}
    </MainLayout>
  )
}

export default SettingsPage
