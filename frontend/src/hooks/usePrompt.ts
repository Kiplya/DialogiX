import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'

const usePrompt = (isShouldBlocked: boolean) => {
  const { t } = useTranslation('common')
  const blocker = useBlocker(isShouldBlocked)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirm = window.confirm(t('blockerText'))

      if (confirm) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker, t])
}

export default usePrompt
