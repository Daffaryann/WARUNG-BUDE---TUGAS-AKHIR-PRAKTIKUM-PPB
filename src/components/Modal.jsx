export function Modal({ show, onClose, children }) {
  return (
    <div className={`modal-bg${show ? ' show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        {children}
      </div>
    </div>
  )
}
