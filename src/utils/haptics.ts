/**
 * haptics.ts
 * Utilitas feedback getaran taktil (haptic vibration) untuk perangkat mobile.
 * Mendukung graceful degradation jika peramban tidak mendukung navigator.vibrate.
 */

export function triggerHaptic(type: 'start' | 'stop' | 'tap' | 'error' | 'success') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return
  }

  try {
    switch (type) {
      case 'start':
        // Getaran sedang saat mulai merekam
        navigator.vibrate([35])
        break
      case 'stop':
        // Getaran ganda saat berhenti merekam
        navigator.vibrate([40, 50, 40])
        break
      case 'tap':
        // Klik ringan saat memilih pembicara atau opsi
        navigator.vibrate(15)
        break
      case 'success':
        // Pola sukses saat unduh berkas atau transkripsi selesai
        navigator.vibrate([25, 40, 25])
        break
      case 'error':
        // Pola getar panjang saat error
        navigator.vibrate([60, 40, 60])
        break
    }
  } catch {
    // Abaikan jika ditolak peramban
  }
}
