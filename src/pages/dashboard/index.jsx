import {
  Download,
  ListX,
  Pause,
  Play,
  Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import MainLayout from '@/layouts/MainLayout'
import './style.css'

function DashboardPage() {
  return (
    <MainLayout>
      <section className="control-page">
        <div className="control-inner">
          <h1>Central de Controle</h1>

          <nav className="control-tabs" aria-label="Seções da central">
            <a className="is-active" href="/dashboard">Doações</a>
            <a href="/dashboard">Bloqueados</a>
            <a href="/dashboard">Config. Mensagens</a>
          </nav>

          <div className="control-toolbar">
            <div className="toolbar-status">
              <span></span>
              <strong>Seus alertas estão pausados</strong>
              <small>Pausada</small>
            </div>

            <div className="toolbar-actions">
              <Button className="dashboard-button" type="button" variant="outline">
                <Pause />
                Pular
              </Button>
              <Button className="dashboard-button" type="button" variant="outline">
                <ListX />
                Limpar fila
              </Button>
              <Button className="dashboard-button" type="button" variant="outline">
                <Download />
                Exportar
              </Button>
              <Button className="dashboard-button activate-button" type="button">
                <Play />
                Ativar
              </Button>
            </div>
          </div>

          <div className="donations-empty">
            <Radio />
            <p>Nenhuma doação recebida ainda.</p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default DashboardPage
