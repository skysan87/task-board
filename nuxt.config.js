import packageInfo from './package.json'

export default {
  ssr: false,

  srcDir: 'src',

  target: 'static',

  env: {
    app_version: packageInfo.version
  },

  head: {
    title: 'task-board',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'robots', name: 'robots', content: 'noindex' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    '@/assets/css/tailwind.css',
    '@/assets/css/common.css'
  ],

  plugins: [
    { src: '@/plugins/fontawesome', ssr: false },
    { src: '@/plugins/v-calendar', ssr: false }
  ],

  components: true,

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss'
  ],

  modules: [
    '@nuxtjs/axios'
  ],

  axios: {},

  build: {
  },
  toast: {
    position: 'top-right',
    duration: 3000
  }
}
