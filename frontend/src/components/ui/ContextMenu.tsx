import { FC } from 'react'

import cl from '../../styles/ui/contextMenu/contexMenu.module.css'

export interface ContextMenuOption {
  label: string
  onClick: Function
}

const ContextMenu: FC<{
  args?: Record<string, any>
  onClick: () => void
  leftDirection: boolean
  posX: number
  posY: number
  isOpen: boolean
  options: ContextMenuOption[]
}> = ({ args, onClick, leftDirection, posX, posY, isOpen, options }) => (
  <>
    {isOpen && (
      <div
        className={cl.contextMenuDiv}
        onClick={onClick}
        style={leftDirection ? { top: posY, right: window.innerWidth - posX } : { top: posY, left: posX }}
      >
        <ul>
          {options.map((option, index) => (
            <li key={index} onClick={() => option.onClick(args)}>
              <p>{option.label}</p>
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
)

export default ContextMenu
