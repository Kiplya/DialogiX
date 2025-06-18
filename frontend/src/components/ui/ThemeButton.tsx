import { FC, useCallback, useState } from 'react'

const ThemeButton: FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme'))

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)

    setTheme(newTheme)
    document.body.classList.toggle('light-theme')
  }, [theme, setTheme])

  return (
    <img
      src={localStorage.getItem('theme') === 'light' ? 'img/light-theme-button.webp' : 'img/dark-theme-button.webp'}
      alt=''
      onClick={toggleTheme}
    />
  )
}

export default ThemeButton
