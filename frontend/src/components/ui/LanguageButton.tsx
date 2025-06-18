import i18n from 'i18next'
import { FC, useCallback, useState } from 'react'

const LanguageButton: FC = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language'))

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'ru' ? 'en' : 'ru'
    i18n.changeLanguage(newLanguage)

    localStorage.setItem('language', newLanguage)
    setLanguage(newLanguage)
  }, [language, setLanguage])

  return <p onClick={toggleLanguage}>{language?.toUpperCase()}</p>
}

export default LanguageButton
