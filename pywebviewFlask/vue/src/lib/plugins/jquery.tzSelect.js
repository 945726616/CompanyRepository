/* eslint-disable */
import publicFunc from '../../util/public'
(function ($) {
  var hack_tzSelectCss = 1;
  var noHide = 0;
  $.fn.tzSelect = function (options, isEdit) {
    var me = this;
    if (hack_tzSelectCss) {/* hack by kugle for < IOS under 6.0 */
      var userAgent = navigator.userAgent,
        is_ios45 = ((userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/iPad/i))) && Boolean(userAgent.match(/OS [4-5]_\d[_\d]* like Mac OS X/i)),
        sheets, rules, i, j;
      if (is_ios45) {
        sheets = document.styleSheets;
        for (i = 0; i < sheets.length; ++i) {
          rules = sheets[i].rules || sheets[i].cssRules;
          for (j = 0; j < rules.length; j++) {
            if (rules[j].selectorText == ".tzSelect") {
              rules[j].style.position = "static";
            }
            else if (rules[j].selectorText == ".tzSelect .dropDown") {
              rules[j].style.position = "relative";
              rules[j].style.top = "-10px";
            }
          }
        }
      }
      hack_tzSelectCss = 0;
    }

    options = $.extend({
      render: function (text) {
        return $('<li>').html(text);
      },
      className: ''
    }, options);

    this.siblings(".tzSelect").remove();


    this.each(function () {

      // The "this" points to the current select element:
      var mcs_connect_fail = ["Connect fail", "连接错误", "連接錯誤", "接続に失敗しました", "연결 오류", "Verbindungsfehler", "Verbindungsfehler", "Error de conexión", "Erro de conexão", "Connessione Errata", "وضع النقاط الساخنة", "Ошибка cоединения", "Kapcsolódási hiba"];
      var select = $(this);
      var htmString, optionText, isScrollarCreate = 0;;
      if (isEdit) {
        htmString = '<div class="selectBox"></div><input type="text" id="select_network_edit" >'
      }
      else {
        htmString = '<div class="selectBox"></div>';
      }
      var selectBoxContainer = $('<div>').addClass('tzSelect').html(htmString);

      var dropDown = $('<ul>').addClass('dropDown');
      var selectBox = selectBoxContainer.find('.selectBox');
      var select_network_edit = selectBoxContainer.find('#select_network_edit');
      // Looping though the options of the original select element

      select.find('option').each(function (i) {
        var option = $(this);
        if (i == select.get(0)['selectedIndex']) {
          optionText = getOptionText(option.text());
          selectBox.html(optionText);
          if (select_network_edit[0]) {
            select_network_edit[0].value = option.text();
          }
        }
        select_network_edit.focus(function () {
          $("#manager_page").mCustomScrollbar("update")
          if (select_network_edit[0].value == "未选择") {
            select_network_edit[0].value = "";
          }
        });
        // As of jQuery 1.4.3 we can access HTML5 
        // data attributes with the data() method.

        if (option.data('skip')) {
          return true;
        }

        // Creating a dropdown item according to the
        // data-icon and data-html-text HTML5 attributes:

        var li;
        optionText = getOptionText(option.text());
        if (option[0].getAttribute("front_img") || option[0].getAttribute("rear_img")) {
          if (option[0].getAttribute("front_img") && option[0].getAttribute("rear_img")) {
            li = options.render("<img class='front_img' src='" + option[0].getAttribute("front_img") + "' style='position:absolute;left:0px;margin-top:4px;margin-left:4px'/><span>" + optionText + "</span><img class='rear_img' src='" + option[0].getAttribute("rear_img") + "' style='position:absolute;right:0px;width:20px;'/>");
            li[0].style.color = "#6DBD39";
            li[0].style.fontWeight = 700;
          }
          else if (option[0].getAttribute("front_img")) {
            li = options.render("<img class='front_img' src='" + option[0].getAttribute("front_img") + "' style='position:absolute;left:0px;margin-top:4px;margin-left:4px'/><span>" + optionText + "</span>");
            li[0].style.color = "#6DBD39";
            li[0].style.fontWeight = 700;
          }
          else {
            li = options.render("<img class='rear_img' src='" + option[0].getAttribute("rear_img") + "' style='position:absolute;right:0px;width:20px'/><span>" + optionText + "</span>");
          }
        }
        else
          li = options.render(optionText);

        li[0].selected_index = i;
        li.click(function () {
          optionText = getOptionText(option.text());
          selectBox.html(optionText);
          dropDown.trigger('hide');
          // When a click occurs, we are also reflecting
          // the change on the original select element:
          select.val(option.val());
          if ((selectBox[0].parentNode.previousSibling).change_value) {
            (selectBox[0].parentNode.previousSibling).change_value({ index: this.selected_index });
          }
          if (select_network_edit[0]) {
            select_network_edit[0].value = option.text();
            optionText = option.text();
          }
          return false;
        });

        dropDown.append(li);
      });

      selectBoxContainer.append(dropDown.hide());
      select.hide().after(selectBoxContainer);

      // Binding custom show and hide events on the dropDown:

      dropDown.bind('show', function () {

        if (dropDown.is(':animated')) {
          return false;
        }

        if (me.find("option").length > 12 && isEdit != 1) {
          $("#manager_page").mCustomScrollbar("update");
          publicFunc.mx(".dropDown", me[0].parentNode)[0].style.height = 320 + "px";
          if (!isScrollarCreate) {
            $(publicFunc.mx(".dropDown", me[0].parentNode)[0]).mCustomScrollbar();
            isScrollarCreate = 1;
          }
        }

        selectBox.addClass('expanded');
        dropDown.slideDown("fast", function () {
          if (me.find("option").length > 12 && isEdit != 1) {
            $(publicFunc.mx(".dropDown", select[0].parentNode)[0]).mCustomScrollbar("update");
          }
          var wifiConnection;//wifi连接状态
          if (publicFunc.mx("#ssid_status")) {
            for (var i = 0; i < mcs_connect_fail.length; i++) {
              if ((publicFunc.mx("#ssid_status").title == mcs_connect_fail[i])) { wifiConnection = 15; break; } else { wifiConnection = 20; }
            }
          }
          if (me.find("option").length > wifiConnection && isEdit == 1) {
            let addHight = me.find("option").length - wifiConnection;
            $("#manager_page").mCustomScrollbar("update", 30 * addHight);
            if ($("#device_manager_content")) {
              var divHeight = $("#device_manager_content").height();
              $("#device_manager_content").height(30 * addHight + divHeight);
              // divAddHeight=1;
            }
          }

        });

      }).bind('hide', function () {
        // return false;
        if (dropDown.is(':animated')) {
          return false;
        }
        if ($("#device_manager_content")) {
          $("#device_manager_content").css('height', '');
        }
        selectBox.removeClass('expanded');
        dropDown.slideUp("fast");
        // if(noHide){noHide=0; return;}
        if (me.find("option").length > 12) {
          $("#manager_page").mCustomScrollbar("update");
          //$(publicFunc.mx(".dropDown", me[0].parentNode)[0]).mCustomScrollbar("destroy");
        }

      }).bind('toggle', function () {
        if (selectBox.hasClass('expanded')) {
          dropDown.trigger('hide');
        }
        else dropDown.trigger('show');
      });
      function is_ancestor (ancestor, child) {
        var e, body = document.body, parentNode = "parentNode";
        if (ancestor == body) {
          return true;
        }

        for (e = child[parentNode]; e && e != body; e = e[parentNode]) {
          if (ancestor === e) {
            return true;
          }
        }

        return false;
      }
      selectBox.click(function (evt) {
        var e = evt || window.event, target = e.target || e.srcElement;

        if (!target || is_ancestor(this, target)) return;

        dropDown.trigger('toggle');
      });
      // If we click anywhere on the page, while the
      // dropdown is shown, it is going to be hidden:
      $(document).click(function (e) {
        if ($("#device_manager_content")) {
          $("#device_manager_content").css('height', '');
        }

        var event_class = e.target.className;
        var event_div_id = "";//
        if (typeof (event_class) == "string") {
          if ((event_class.indexOf("mCSB_") != -1 || event_class.indexOf("mCS_") != -1) && event_div_id != "device_manager_content") {
            event_div_id = e.target.lastChild.id;
            if (event_div_id != "device_manager_content") {
              return false;
            }
          }
        }

        dropDown.trigger('hide');

      });
      function getOptionText (text) {
        optionText = text;
        if (optionText.length > 18) {
          optionText = optionText.substring(0, 18) + "...";
        }
        return optionText;
      }
      $(publicFunc.mx(".dropDown", me[0].parentNode)[0]).click(function (e) { });

    });
    /*if(this.find("option").length > 8)
    {
        publicFunc.mx(".dropDown", this[0].parentNode)[0].style.height = 200 + "px";
        $(publicFunc.mx(".dropDown", this[0].parentNode)[0]).mCustomScrollbar();
    }*/
  }
})(jQuery);
