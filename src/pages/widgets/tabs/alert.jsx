import { Bell } from 'lucide-react'

function AlertTab() {
  return (
    <div className="px-8 pb-6 max-[720px]:px-4">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="size-4 text-[var(--dashboard-accent)]" />
        <h2 className="m-0 text-base font-extrabold text-[var(--dashboard-text)]">
          Configurações do alerta
        </h2>
      </div>

      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-6">
        <p className="m-0 text-sm text-[var(--dashboard-muted)]">
          Em breve você poderá personalizar os alertas por aqui.
        </p>
      </div>
    </div>
  )
}

export default AlertTab
