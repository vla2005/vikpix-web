import RegisterPage from './pages/register'

function App() {
  if (window.location.pathname !== '/register') {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <h1>404</h1>
      </main>
    )
  }

  return <RegisterPage />
}

export default App
