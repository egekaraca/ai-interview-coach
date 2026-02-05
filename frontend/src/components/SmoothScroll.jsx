// src/components/SmoothScroll.jsx
import { ReactLenis } from '@studio-freight/react-lenis'

export default function SmoothScroll({ children }) {

  // AYARLAR (Lando Norris hissi için):
  const lenisOptions = {
    lerp: 0.1,         // Akışkanlık değeri (Düşük = Daha ağır/yumuşak, Yüksek = Daha sert)
    duration: 1.5,     // Kaydırmanın ne kadar süreceği (Saniye)
    smoothWheel: true, // Mouse tekerleği için yumuşatma
    wheelMultiplier: 1, // Tekerlek hızı
    touchMultiplier: 2, // Dokunmatik ekran hızı
  }

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  )
}