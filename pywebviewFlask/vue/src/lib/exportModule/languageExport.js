// 采用将语言缩写存储在sessionStorage中进行语言的切换操作
import store from '../../store'
const chooseLanguage = {
  lang(lang) {
    store.dispatch('setUserLanguage', lang)
    return import(`../plugins/language/language.${lang}.min.js`)
  }
}

export default chooseLanguage
