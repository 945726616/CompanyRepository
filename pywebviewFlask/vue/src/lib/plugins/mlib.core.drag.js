/*
    mdrag
    depends :
        mlib.core.evt.js

    author: chengzhiyong date:2014-08-13 action: cut from core.js 
*/

/* mdrag(el, mousedown_evt, on_update) */
function mdrag(el, mousedown_evt, on_update, on_update_ref)
{
    var stl = el.style, o_cursor = stl.cursor, mevt = window.mevt,
        ix = el.offsetLeft, iy = el.offsetTop, mx = mousedown_evt.clientX, my =  mousedown_evt.clientY,
        dc = document, dc_xel = (dc.compatMode == "CSS1Compat")?dc.documentElement:null;

    stl.cursor = "move";
    mevt.bind(dc, "mousemove", on_evt);
    mevt.bind(dc, "mouseup", on_evt);
    mevt.bind(dc, "blur", on_evt);
    if (el.setCapture){ el.setCapture(); mevt.bind(el, "losecapture", on_evt); }/*ie*/

    mevt.stop (mousedown_evt);
    mevt.mude (mousedown_evt);

   /* title_twinkle (null);
   try {
       im.session.im_box.group_menu.hide (null);
   } catch (e) {}
   xxxxxxxxxx refer im */
    function on_evt(e)
    {
        switch((e = e || window.event).type)
        {
            case "blur":
            case "losecapture":
            case "mouseup":
            {
                stl.cursor = o_cursor;
                mevt.unbind(dc, "mousemove", on_evt);
                mevt.unbind(dc, "mouseup", on_evt);
                mevt.unbind(dc, "blur", on_evt);
                if(el.releaseCapture){ mevt.unbind(el, "losecapture", on_evt); el.releaseCapture(); }
                break;
            }
            case "mousemove":
            {
                var x = (ix + e.clientX - mx), y = (iy + e.clientY - my),
                    p = el.offsetParent,
                    xmx = Math.max(p.scrollWidth, p.clientWidth),
                    ymx = Math.max(p.scrollHeight, p.clientHeight, (dc_xel && (p == dc.body))?dc_xel.clientHeight:0);

                if((x + el.offsetWidth) > xmx){ x = xmx - el.offsetWidth; }
                if((y + el.offsetHeight) > ymx){ y = ymx - el.offsetHeight; }
                if(x < 0){ x = 0; }
                if(y < 0){ y = 0; }
                stl.left = x + "px";
                stl.top = y + "px";
                if(on_update){ on_update(on_update_ref); }
                break;
            }
        }
        mevt.stop (e);
    }
}
