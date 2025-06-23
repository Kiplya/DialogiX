import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('language') || 'ru',
  fallbackLng: 'en',
  ns: ['auth', 'reg', 'common'],

  resources: {
    en: {
      msg: {
        nonSelectedDialogText: 'Select a conversation partner and start chatting!',
        searchPlaceholderText: 'Search by username',
        notFounedUsersText: 'No users found',
        profileText: 'Profile',
        currentThemeText: 'Switch theme',
        currentLanguageText: 'Change language',
        logoutText: 'Log out',
        logoutConfirmText: 'Are you sure you want to log out?',
      },

      common: {
        blockerText: 'You have unsaved changes. Leave the page?',
        acceptText: 'Yes',
        declineText: 'No',
      },

      reg: {
        regText: 'Sign up',
        passwordText: 'Password',
        usernameText: 'Username',
        regButtonText: 'Register',
        accountText: 'Already have an account?',
        hrefText: 'Sign in!',
        invalidPasswordText: 'Invalid password',
        invalidEmailText: 'Invalid Email',
        invalidUsernameText: 'Invalid username',
        emailExistText: 'Email is already taken',
        usernameExistText: 'Username is already taken',
        successRegText: 'Successful registration',
      },

      auth: {
        authText: 'Sign in',
        passwordText: 'Password',
        loginButtonText: 'Log in',
        accountText: 'No account?',
        hrefText: 'Create one!',
        invalidEmailText: 'Invalid Email',
        invalidPasswordText: 'Invalid password',
        failureLoginText: 'Invalid credentials',
      },
    },
    ru: {
      msg: {
        nonSelectedDialogText: 'Выбирите собеседника и начните общаться!',
        searchPlaceholderText: 'Поиск по никнейму',
        notFounedUsersText: 'Пользователи не найдены',
        profileText: 'Профиль',
        currentThemeText: 'Сменить тему',
        currentLanguageText: 'Сменить язык',
        logoutText: 'Выйти',
        logoutConfirmText: 'Вы действительно хотите выйти?',
      },

      common: {
        blockerText: 'У вас есть несохранённые изменения. Покинуть страницу?',
        acceptText: 'Да',
        declineText: 'Нет',
      },

      reg: {
        regText: 'Регистрация',
        passwordText: 'Пароль',
        usernameText: 'Никнейм',
        regButtonText: 'Зарегистрироваться',
        accountText: 'Есть аккаунт?',
        hrefText: 'Войдите!',
        invalidPasswordText: 'Недопустимый пароль',
        invalidEmailText: 'Неверная почта',
        invalidUsernameText: 'Недопустимый никнейм',
        emailExistText: 'Почта занята',
        usernameExistText: 'Никнейм занят',
        successRegText: 'Успешная регистрация',
      },

      auth: {
        authText: 'Авторизация',
        passwordText: 'Пароль',
        loginButtonText: 'Войти',
        accountText: 'Нет аккаунта?',
        hrefText: 'Создайте!',
        invalidEmailText: 'Неверная почта',
        invalidPasswordText: 'Недопустимый пароль',
        failureLoginText: 'Неверные данные',
      },
    },
  },
})

export default i18n
