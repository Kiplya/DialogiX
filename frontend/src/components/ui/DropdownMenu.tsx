import { FC, useState, MouseEvent } from 'react'

import cl from '../../styles/ui/dropdownMenu/dropdownMenu.module.css'

export interface DropdownMenuOption {
  label: string
  onClick: (event: MouseEvent) => void
}

interface DropdownMenuProps {
  className?: string
  options: DropdownMenuOption[]
  label?: string
  imgUrl?: string
}

const DropdownMenu: FC<DropdownMenuProps> = ({ className, options, label, imgUrl }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`${cl.dropdownDiv} ${className ?? ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {label && <span>{label}</span>}
      {imgUrl && <img src={imgUrl} alt='' />}

      {isOpen && (
        <ul>
          {options.map(({ label, onClick }, index) => (
            <li key={index} onClick={onClick}>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DropdownMenu
