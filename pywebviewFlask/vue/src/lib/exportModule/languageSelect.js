// 多国语言选择下拉
import store from '../../store'
import chooseLanguage from './languageExport'
let languageSelect = {
  mipc (domNode) {
    domNode.append("<div id='select_lang_btn'>"
      + "<select id='select_language_mipc_new' class='select_language_mipc_new'>"
      + "<option class='select_language_option' tag='zh' value='zh'>中文(简体)</option>"
      + "<option class='select_language_option' tag='tw' value='tw'>中文(繁体)</option>"
      + "<option class='select_language_option' tag='ja' value='ja'>日本語</option>"
      + "<option class='select_language_option' tag='ko' value='ko'>한국의</option>"
      + "<option class='select_language_option' tag='de' value='de'>Deutsch</option>"
      + "<option class='select_language_option' tag='fr' value='fr'>française</option>"
      + "<option class='select_language_option' tag='es' value='es'>española</option>"
      + "<option class='select_language_option' tag='ar' value='ar'>العربية</option>"
      + "<option class='select_language_option' tag='pt' value='pt'>português</option>"
      + "<option class='select_language_option' tag='it' value='it'>italiana</option>"
      + "<option class='select_language_option' tag='ru' value='ru'>русский</option>"
      + "<option class='select_language_option' tag='en' value='en'>English</option>"
      + "<option class='select_language_option' tag='hu' value='hu'>magyar</option>"
      + "<option class='select_language_option' tag='nl' value='nl'>Nederlands</option>"
      + "<option class='select_language_option' tag='sk' value='sk'>slovenského jazyk</option>"
      + "<option class='select_language_option' tag='tr' value='tr'>Türk dili</option>"
      + "<option class='select_language_option' tag='cz' value='cz'>Česky</option>"
      + "<option class='select_language_option' tag='vi' value='vi'>Người việt nam</option>"
      + "<option class='select_language_option' tag='iw' value='iw'>עברית</option>"
      + "<option class='select_language_option' tag='pl' value='pl'>Polski</option>"
      + "<option class='select_language_option' tag='uk' value='uk'>Українська мова</option>"
      + "<option class='select_language_option' tag='th' value='uk'>ภาษาไทย</option>"
      + "</select>"
      + "</div>")
    if (store.state.user.userLanguage) { // 根据session中存储的语言类型渲染下拉选择框
      let select_language_option_length = $(".select_language_option").length
      for (let lang_num = 0; lang_num < select_language_option_length; lang_num++) {
        if (store.state.user.userLanguage === $(".select_language_option")[lang_num].value) { // 此处jq获取到的为原生dom节点,非jq节点
          $(".select_language_option")[lang_num].selected = true
        }
      }
    }
    //根据参数来设置 dom的样式
    $('#select_language_mipc_new').on('change', function () {
      let lang_val = $('#select_language_mipc_new').val()
      localStorage.setItem("language_choice_info",lang_val)
      chooseLanguage.lang(lang_val)
      location.reload()
    })
  }
}
export default languageSelect
