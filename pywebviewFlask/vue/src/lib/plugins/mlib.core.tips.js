/*
    malert_box, mtip_box, mprompt_box
    
    depends:
        mlib.core.evt.js
        mlib.core.base.js
        mlib.core.hack.js

    author: chengzhiyong date:2014-08-31 action: cut from core.js
*/
/*-----------------malert_box--------------------------------------------------*/
var malert_box = (function () {
    var id = "alert_ex", class_name = "message_box", default_title = "提醒",
    msg_box, close, title, content;

    return function (string1, title1, callback) {
        if (!msg_box)
        {
            msg_box = document.createElement ("div");
            msg_box.id = "alert_ex";
            msg_box.className = "message_box";

            msg_box.innerHTML = '<div class="head"><div class="title"></div></div>'
            + '<div class="body">'
            +   '<div class="content"></div>'
            +   '<div class="submit">'
            +       '<button class="close smallBtn">确定</button>'
            +   '</div>'
            + '</div>';

            document.body.appendChild (msg_box);
            title = $(".title", msg_box)[0];
            content = $(".content", msg_box)[0];
            close = $(".close", msg_box)[0];
            close.onclick = function (e) {
                if (callback)
                {
                    callback ();
                }
                msg_box.style.display = "none";
                mevt.stop (e || window.event);
            }
        }

        title.innerHTML = title1 || default_title;
        content.innerHTML = string1;
        msg_box.style.display = "";
        msg_box.style.left = (viewport_width () - msg_box.clientWidth) / 2 + "px";
    }
}) ();
/*-----------------malert_box--------------------------------------------------*/
/*-----------------mtip_box--------------------------------------------------*/
var mtip_box = (function () {
    var id = "tip_ex", default_title = "提醒", default_timeout = 1500,
    default_interval = 125, timeout_timer, interval_timer,
    msg_box, title, content;

    return function (string1, title1, timeout/* miliseconds */, interval /* miliseconds */) {
        if (!msg_box)
        {
            msg_box = document.createElement ("div")
            msg_box.id = id;
            msg_box.className = "message_box";

            msg_box.innerHTML = '<div class="head"><div class="title"></div></div>'
            + '<div class="body">'
            +   '<div class="content"></div>'
            + '</div>';

            document.body.appendChild (msg_box);
            title = $(".title", msg_box)[0];
            content = $(".content", msg_box)[0];
        }

        title.innerHTML = title1 || default_title;
        content.innerHTML = string1;

        msg_box.style.cssText = "";
        msg_box.style.left = (viewport_width() - msg_box.clientWidth) / 2 + "px";

        if (timeout_timer)
        {
            clearTimeout (timeout_timer);
            timeout_timer = null;
        }

        if (interval_timer)
        {
            clearInterval (interval_timer);
            interval_timer = null;
        }

        timeout_timer = setTimeout (function () {
            var alpha = 1, orig_css = msg_box.style.cssText;
            timeout_timer = null;
            interval_timer = setInterval (function () {
                msg_box.style.cssText = mhack.css_alpha (alpha -= 1/4) + orig_css;

                if (alpha == 0)
                {
                    msg_box.style.cssText = "";
                    msg_box.style.display = "none";
                }
            }, interval || default_interval);
        }, timeout || default_timeout);
    }
})();
/*-----------------mtip_box--------------------------------------------------*/
/*-----------------mprompt_box--------------------------------------------------*/
/*
 * question
 * answer
 * ok_callback
 * cancel_callback */
var mprompt_box = (function () {
    var id = "prompt_ex", class_name = "message_box",
    msg_box, question, answer, ok_btn, cancel_btn;

    return function (obj) {
        var me = this, msg_box;

        if (!msg_box)
        {
            msg_box = document.createElement ("div");
            msg_box.id = id;
            msg_box.className = class_name;
            msg_box.innerHTML = '<div class="body">'
            +   '<div class="content">'
            +       '<label class="question"></label>'
            +       '<input class="answer"></input>'
            +   '</div>'
            +   '<div class="submit">'
            +       '<button class="ok smallBtn">确定</button>&nbsp;&nbsp;&nbsp;'
            +       '<button class="cancel smallBtn">取消</button>'
            +   '</div>'
            + '</div>';

            document.body.appendChild (msg_box);

            question = $(".question", msg_box)[0];
            answer = $(".answer", msg_box)[0];
            ok_btn = $(".ok", msg_box)[0];
            cancel_btn = $(".cancel", msg_box)[0];

            answer.onkeypress = function (e) {
                var evt = e || window.event;
                if ((evt.which | evt.keyCode) == 13)
                {
                    ok_btn.click ();
                    evt.returnValue = false;
                }
            }
        }

        question.innerHTML = obj.question;
        answer.value = obj.answer || "";
        answer.select ();

        msg_box.style.display = "";
        ok_btn.onclick = function () {
            if (obj.ok_callback)
            {
                obj.ok_callback (answer.value);
            }
            msg_box.style.display = "none";
        }

        cancel_btn.onclick = function () {
            if (obj.cancel_callback)
            {
                obj.cancel_callback ();
            }
            msg_box.style.display = "none";
        }

        msg_box.style.left = (viewport_width() - msg_box.clientWidth) / 2 + "px";
    }
})();
/*-----------------mprompt_box--------------------------------------------------*/

