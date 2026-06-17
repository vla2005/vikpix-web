import MainLayout from '@/layouts/MainLayout'
import { navigate } from '@/lib/navigation'
import { settingsTabs } from './shared-data'
import './style.css'

export function SettingsShell({ activeLabel, children, toast }) {
  return (
    <MainLayout>
      {({ user }) => (
        <section className="settings-page min-h-dvh bg-[var(--dashboard-surface)] text-[var(--dashboard-text)]">
          {toast}

          <div className="ml-7 w-[min(900px,calc(100%-56px))] py-6 max-[860px]:mx-auto max-[860px]:w-[min(620px,calc(100%-28px))]">
            <header className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#8c9298]">
                <span>Configurações</span>
                <span className="text-[#4b5157]">/</span>
                <span className="text-[#24b8ca]">{activeLabel}</span>
              </div>
              <h1 className="mt-0 mb-1.5 text-[24px] leading-[1.1] font-extrabold tracking-[-0.025em] text-[#f1f3f4]">
                Configurações
              </h1>
              <p className="m-0 text-sm text-[#8c9298]">
                Gerencie seu perfil e as configurações da sua conta
              </p>
            </header>

            <div className="grid grid-cols-[192px_minmax(0,576px)] items-start gap-12 max-[860px]:grid-cols-1 max-[860px]:gap-7">
              <nav
                aria-label="Configurações"
                className="grid gap-1 max-[860px]:flex max-[860px]:gap-2 max-[860px]:overflow-x-auto"
              >
                {settingsTabs.map((tab) => (
                  <button
                    className={`settings-tab h-9 cursor-pointer rounded-full border-0 bg-transparent px-3 text-left text-sm font-bold transition max-[860px]:shrink-0 ${activeLabel === tab.label ? 'is-active' : ''}`}
                    key={tab.path}
                    type="button"
                    onClick={() => navigate(tab.path)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {children({ user })}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  )
}
