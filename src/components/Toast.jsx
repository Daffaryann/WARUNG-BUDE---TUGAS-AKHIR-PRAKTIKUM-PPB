import { useState, useCallback, useRef } from 'react'

let _showToast = null

export function useToast() {
  const show = useCallback((msg) => { if (_showToast) _showToast(msg) }, [])
  return show
}

export function Toast() {
  const [msg, setMsg]       = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  _showToast = (m) => {
    setMsg(m)
    setVisible(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 2200)
  }

  return (
    <div className="toast-container">
      <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
    </div>
  )
}
