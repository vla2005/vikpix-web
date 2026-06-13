import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

const DonationQrCode = forwardRef(function DonationQrCode({
  url,
  color,
  backgroundColor,
  logoUrl,
  className = '',
  size = 240,
}, ref) {
  const containerRef = useRef(null)
  const qrCodeRef = useRef(null)

  useImperativeHandle(ref, () => ({
    downloadPng() {
      qrCodeRef.current?.download({
        name: 'vikpix-qrcode',
        extension: 'png',
      })
    },
  }))

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      type: 'svg',
      data: url,
      image: logoUrl,
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        color,
        type: 'square',
      },
      cornersSquareOptions: {
        color,
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color,
        type: 'dot',
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.22,
      },
    })

    qrCodeRef.current = qrCode

    const container = containerRef.current

    if (container) {
      container.innerHTML = ''
      qrCode.append(container)
    }

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [backgroundColor, color, logoUrl, size, url])

  return (
    <div className={className}>
      <div ref={containerRef} aria-label="QR Code da pagina de doacoes" />
    </div>
  )
})

export default DonationQrCode
