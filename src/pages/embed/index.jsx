import { useEffect, useState } from 'react'
import DonationQrCode from '@/components/DonationQrCode'

const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'
const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
const logoUrl = '/logo-sem-fundo.png'

const defaultWidget = {
  active: true,
  primaryColor: '#1db8ce',
  secondaryColor: '#ffffff',
  showLink: true,
  showMessage: true,
  message: 'Aponte a câmera do celular',
}

function shortenUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function getDonationUrl(widget) {
  if (widget?.donationUrl || widget?.publicUrl || widget?.url) {
    return widget.donationUrl || widget.publicUrl || widget.url
  }

  const username =
    widget?.streamerSlug ||
    widget?.slug ||
    widget?.userName ||
    widget?.username ||
    widget?.streamer?.slug ||
    widget?.streamer?.userName ||
    widget?.streamer?.username ||
    widget?.user?.slug ||
    widget?.user?.userName ||
    widget?.user?.username

  if (username) {
    return `${appUrl}/${username}`
  }

  return appUrl
}

function normalizeWidget(data) {
  const widget = data?.widget || data?.qrcode || data || {}

  return {
    ...defaultWidget,
    ...widget,
    primaryColor: widget.primaryColor || widget.color || defaultWidget.primaryColor,
    secondaryColor: widget.secondaryColor || widget.backgroundColor || defaultWidget.secondaryColor,
  }
}

function EmbedPage({ token }) {
  const [widget, setWidget] = useState(defaultWidget)
  const [loading, setLoading] = useState(() => Boolean(token))
  const [notFound, setNotFound] = useState(() => !token)

  useEffect(() => {
    const root = document.getElementById('root')
    const previousHtmlBackground = document.documentElement.style.background
    const previousBodyBackground = document.body.style.background
    const previousRootBackground = root?.style.background

    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'

    if (root) {
      root.style.background = 'transparent'
    }

    return () => {
      document.documentElement.style.background = previousHtmlBackground
      document.body.style.background = previousBodyBackground

      if (root) {
        root.style.background = previousRootBackground || ''
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadWidget() {
      setLoading(true)
      setNotFound(false)

      try {
        const response = await fetch(`${apiUrl}/widgets/qrcode/${encodeURIComponent(token)}`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          setNotFound(true)
          return
        }

        const data = await response.json()
        setWidget(normalizeWidget(data))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      return undefined
    }

    loadWidget()

    return () => controller.abort()
  }, [token])

  if (loading || notFound || widget.active === false) {
    return <main style={{ minHeight: '100dvh', background: 'transparent' }} />
  }

  const donationUrl = getDonationUrl(widget)
  const shortUrl = shortenUrl(donationUrl)
  const displayUrl = shortUrl.length <= 28 ? shortUrl : `${shortUrl.slice(0, 25)}...`

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        fontFamily: 'Instrument Sans, Arial, sans-serif',
      }}
    >
      <div style={{ width: 192, overflow: 'hidden', borderRadius: 8 }}>
        {widget.showLink ? (
          <div
            style={{
              background: widget.primaryColor,
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 800,
              overflow: 'hidden',
              padding: '12px 16px',
              textAlign: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayUrl}
          </div>
        ) : null}

        <div
          style={{
            background: widget.secondaryColor,
            display: 'grid',
            padding: 16,
            placeItems: 'center',
          }}
        >
          <DonationQrCode
            backgroundColor={widget.secondaryColor}
            className="[&_svg]:block [&_svg]:h-40 [&_svg]:w-40"
            color={widget.primaryColor}
            logoUrl={logoUrl}
            size={160}
            url={donationUrl}
          />
        </div>

        {widget.showMessage ? (
          <div
            style={{
              background: widget.primaryColor,
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1.35,
              padding: '12px 16px',
              textAlign: 'center',
            }}
          >
            {widget.message}
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default EmbedPage
