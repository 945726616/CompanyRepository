/*
    mhack
    depends : none
    author : chengzhiyong    date : 2014-08-13   action : add denpends info
*/
(function(window,document){
    var border_space, padding_space, text_border_space, td_bdv, tmp, agent = navigator.userAgent,
        body/* init flag */,
        opera = 0 <= agent.indexOf("Opera"),
        ie_ver, ie_mode, ie = (!opera) && (0 <= agent.indexOf("compatible")) && (0 <= agent.indexOf("MSIE")),
        firefox = (0 <= agent.indexOf("Firefox")),
        safari = (0 <= agent.indexOf("Safari")) && (0 > agent.indexOf("Chrome")),
        chrome =  0 <= agent.indexOf("Chrome"),
        webkit = 0 <= agent.indexOf("Webkit"),
        gecko = 0 <= agent.indexOf("Gecko"),
        s_offsetWidth = "offsetWidth",
	s_createElement = "createElement",
        inited = false;

    /* test ie ver */
    if(ie)
    {
       if(!(ie_mode = document.documentMode)) { ie_mode = ("CSS1Compat" == document.compatMode)?7:5; }
       tmp = new RegExp("MSIE (\\d+\\.\\d+);");
       tmp.test(agent);
       ie_ver = parseFloat(RegExp["$1"]);
    }

    function init()
    {
        if(body){return;}
        body = document.body;

        tmp = document[s_createElement]("div");
        body.appendChild(tmp);
        tmp.style.cssText = "width:3px;margin:0px;padding:0px;border:1px solid white;";
        border_space = ((tmp[s_offsetWidth] - 3) / 2);
        tmp.style.cssText = "width:3px;border:none;margin:0px;padding:1px;";
        padding_space = ((tmp[s_offsetWidth] - 3) / 2);
        tmp.innerHTML = "<table style=\"border-collapse:separate;border-spacing:0;\"><tr><td style=\"height:3px; border:0px\"></td></tr></table>"
        td_bdv = (((tmp.getElementsByTagName( "td" )[0])[s_offsetHeight] - 3) / 2);
        body.removeChild(tmp);

        tmp = document[s_createElement]("textarea");
        body.appendChild(tmp);
        tmp.style.cssText = "width:10px;border:1px solid white;margin:0px;padding:0px";
        text_border_space = ((tmp[s_offsetWidth] - 10) / 2);
        tmp.style.cssText = "width:10px;border:0px solid white;margin:0px;padding:1px";
        text_padding_space = ((tmp[s_offsetWidth] - 10) / 2);
        body.removeChild(tmp);
    }

    window.mhack = {
        magic:"mhack",
        ie_mode:ie_mode,
        ie:ie,
        ie_ver:ie_ver,
        chrome:chrome,
        opera:opera,
        get_border_space:function(){ init(); return border_space; },
        get_padding_space:function(){ init(); return padding_space; },
        get_text_border_space:function(){ init(); return text_border_space; },
        get_text_padding_space:function(){ init(); return text_padding_space; },
        get_td_border_space_v:function(){ init(); return td_bdv; },
        css_alpha:function(alpha){ return (ie && (ie_mode < 9))?("filter:alpha(opacity=" + (100.0 * alpha) + ");"):("opacity:" + alpha + ";");},
        get_body_height:function(){ init(); return Math.max(body.clientHeight, ((("CSS1Compat" == document.compatMode) && document.documentElement) || body).clientHeight);},
        css_box_shadow:function(size, color)
        {
            tmp = "2px 2px " + size + "px " + color + ";";
            return (ie && (ie_mode < 9))?
                    (   "filter:progid:DXImageTransform.Microsoft.Shadow(color=" + color + ", Direction=135, Strength=" + Math.round(size / 2) + ");" )
                    :(    "-moz-box-shadow:" + tmp /*firefox*/
                        + "-webkit-box-shadow:" + tmp /*webkit*/
                        + "box-shadow:" + tmp /*opera or ie9*/ );
        }
    };
})(window,document);
