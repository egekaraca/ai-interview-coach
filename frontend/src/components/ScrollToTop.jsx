import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // URL (pathname) her değiştiğinde pencereyi en tepeye (0,0) kaydır
    window.scrollTo(0, 0)
  }, [pathname])

  return null // Bu bileşen ekranda hiçbir şey göstermez, sadece lojik çalıştırır
}