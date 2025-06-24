import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import cl from '../../styles/ui/modal/modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: Function
  onConfirm: Function
  modalData: string
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, modalData, onConfirm }) => {
  const { t } = useTranslation('common')

  if (!isOpen) {
    return null
  }

  return (
    <div className={cl.overlay} onClick={() => onClose()}>
      <div onClick={(e) => e.stopPropagation()}>
        <p>{modalData}</p>

        <div>
          <button onClick={() => onConfirm()}>{t('acceptText')}</button>
          <button onClick={() => onClose()}>{t('declineText')}</button>
        </div>
      </div>
    </div>
  )
}

export default Modal
