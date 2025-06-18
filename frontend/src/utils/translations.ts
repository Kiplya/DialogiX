import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('language') || 'ru',
  fallbackLng: 'en',
  ns: ['auth', 'reg', 'common'],

  resources: {
    en: {
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
        invalidPasswordText: 'Short password',
        invalidEmailText: 'Invalid Email',
        invalidUsernameText: 'Short username',
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
        invalidPasswordText: 'Short password',
        failureLoginText: 'Invalid credentials',
      },
    },
    ru: {
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
        invalidPasswordText: 'Короткий пароль',
        invalidEmailText: 'Неверная почта',
        invalidUsernameText: 'Короткий никнейм',
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
        invalidPasswordText: 'Короткий пароль',
        failureLoginText: 'Неверные данные',
      },
    },
  },
})

export default i18n
