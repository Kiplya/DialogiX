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
      },

      common: {
        blockerText: 'You have unsaved changes. Leave the page?',
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
        loginButtonText: 'Login',
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
      },

      common: {
        blockerText: 'У вас есть несохранённые изменения. Покинуть страницу?',
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
