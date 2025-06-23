import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import cl from '../../styles/ui/modal/modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  modalText: string
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, modalText, onConfirm }) => {
  const { t } = useTranslation('common')

  if (!isOpen) {
    return null
  }

  return (
    <div className={cl.overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <p>{modalText}</p>
        <div>
          <button onClick={onConfirm}>{t('acceptText')}</button>
          <button onClick={onClose}>{t('declineText')}</button>
        </div>
      </div>
    </div>
  )
}

export default Modal
