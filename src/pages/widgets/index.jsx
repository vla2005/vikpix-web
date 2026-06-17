import { useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import AlertTab from './tabs/alert'
import GoalsTab from './tabs/goals'
import QrCodeTab from './tabs/qrcode'

const widgetTabs = [
  { id: 'qrcode', label: 'QRCode', Component: QrCodeTab },
  { id: 'alert', label: 'Alerta', Component: AlertTab },
  { id: 'goals', label: 'Metas', Component: GoalsTab },
]

function WidgetsPage() {
  const [activeTab, setActiveTab] = useState(widgetTabs[0].id)
  const ActiveTab = widgetTabs.find((tab) => tab.id === activeTab)?.Component || QrCodeTab
  const widgetsHeader = (
    <div className="px-8 pt-6 max-[720px]:px-4">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--dashboard-heading)]">
            Widgets
          </h1>
        </div>
      </header>

      <nav className="scrollbar-none mb-7 flex gap-6 overflow-x-auto border-b border-[var(--dashboard-border)]" aria-label="Widgets">
        {widgetTabs.map((tab) => (
          <button
            className={`relative shrink-0 cursor-pointer border-0 bg-transparent py-2.5 text-sm font-medium no-underline ${activeTab === tab.id ? 'text-[var(--dashboard-text)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[var(--dashboard-accent)]' : 'text-[var(--dashboard-muted)]'}`}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )

  return (
    <MainLayout>
      {({ user }) => (
        <section className="h-dvh overflow-hidden bg-[var(--dashboard-surface)] text-[var(--dashboard-text)]">
          {activeTab === 'qrcode' ? (
            <QrCodeTab user={user} header={widgetsHeader} />
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              {widgetsHeader}
              <div className="min-h-0 flex-1 overflow-hidden">
                <ActiveTab user={user} />
              </div>
            </div>
          )}
        </section>
      )}
    </MainLayout>
  )
}

export default WidgetsPage
