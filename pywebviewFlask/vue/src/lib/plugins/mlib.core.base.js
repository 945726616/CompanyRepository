/*
    depends : none
    author: chengzhiyong date:2014-08-13 action:cut from core.js
*/

/* mining lib js */
/* eslint-disable */
function meval(s){ try{return eval("(" + s + ")"); }catch(e){return null;} }

function mobj_merge(d, s)
{
    var i, v, o, n;
    if (!s) return d;

    for(n in s)
    {
        if(((v = s[n]) != undefined) && (null != v))
        {
            if (v.constructor === Array)
            {
                d[n] = o = [];
                for (i = 0, len = v.length; i < len; i++)
                {
                    o[i] = v[i];
                }
            }
            else if(typeof(v) != "object"){d[n] = v;}
            else{
                if (((o = d[n]) == undefined) || (null == o)){ d[n] = (o = {}); };
                obj_merge(o, v);
            }
        }
    }
    return d;
}

/*-----------------system object extention tool---------------------------*/
(function(window, String, Date, Array, Function){
    var s_prototype = "prototype",
        Array_prototype = Array[s_prototype],
        String_prototype = String[s_prototype],
        Date_prototype = Date[s_prototype],
        Function_prototype = Function[s_prototype];
        
    String_prototype.cmp = function (s)
    {
        var i, sub, me = this, len = Math.min(me.length, s.length);
        for(i = 0; i < len; i++){ if(sub = me.charCodeAt(i) - s.charCodeAt(i)){ return sub; }; };
        return me.length - s.length;
    }
    String_prototype.trim = function(){return this.replace(/(^\s*)|(\s*$)/g, "");}

    Date_prototype.toString1 = function ()
    {
        var me = this,
            mon = me.getMonth() + 1,
            day = me.getDate(),
            hour = me.getHours(),
            min = me.getMinutes(),
            sec = me.getSeconds();
    
        return me.getFullYear() + "年"
            + ((mon < 10) ? "0":"") + mon + "月"
            + ((day < 10) ? "0":"") + day + "日"
            + ((hour < 10) ? "0":"") + hour + ":"
            + ((min < 10) ? "0":"") + min + ":"
            + ((sec < 10) ? "0":"") + sec;
    }

    Array_prototype.filter = Array_prototype.filter || function (fun)
    {
        var i, val, me = this, len = me.length, res = [], thisp = arguments[1];
        if (typeof fun != "function")
        {
            throw new TypeError();
        }

        for (i = 0; i < len; i++)
        {
            if (i in me)
            {
                val = me[i];
                if (fun.call(thisp, val, i, me))
                {
                    res.push(val);
                }
            }
        }

        return res;
    };

    Array_prototype.some = Array_prototype.some || function(fun /*, thisp*/)
    {
        var me = this, i, len = me.length, thisp = arguments[1];
        if (typeof fun != "function")
        throw new TypeError();

        for (i = 0; i < len; i++)
        {
            if (i in me && fun.call(thisp, me[i], i, me))
            return true;
        }

        return false;
    };

    Array_prototype.forEach = Array_prototype.forEach || function(fun /*, thisp*/)
    {
        var i, me = this, len = me.length, thisp = arguments[1];
        if (typeof fun != "function")
        throw new TypeError();

        for (i = 0; i < len; i++)
        {
            if (i in me)
            fun.call(thisp, me[i], i, me);
        }
    };

    (window.publisher = function()
    {
        this.subscribers = [];
    })[s_prototype].deliver = function ()
    {
        var i = 0, obj, me = this, len, subscribers = me.subscribers, prev_len = subscribers.length;
        while(i < prev_len)
        {
            obj = subscribers[i];
            if (me.filter && !me.filter (obj, arguments)) { i++; continue; }
            obj.fn.apply (obj.fn, arguments);
            len = subscribers[s_length];
            if (prev_len > len) { prev_len = len; }
            else { i++; }
        }    
        return me;
    }

    Function_prototype.subscribe = function (_publisher)
    {
        var len, i = 1, obj = {}, me = this, already_exists = _publisher.subscribers.some (
            function (el) {
                return el.fn === me;
            }
        );
    
        if (!already_exists) {
            for (len = arguments.length; i < len; i++)
            {
                obj ["arg" + (i - 1)] = arguments[i];
            }
    
            obj.fn = me;
            _publisher.subscribers.push (obj);
        }
    
        return me;
    }

    Function_prototype.unsubscribe = function (_publisher)
    {
        var me = this;
        _publisher.subscribers = _publisher.subscribers.filter (
            function (el) {
                return el.fn !== me;
            }
        );
    
        return me;
    };
})(window, String, Date, Array, Function);
/*-----------------system object extention tool---------------------------*/

function is_ancestor (ancestor, child)
{
    var e, body = document.body, parentNode = "parentNode";
    if (ancestor == body)
    {
        return true;
    }

    for (e = child[parentNode]; e && e != body; e = e[parentNode])
    {
        if (ancestor === e)
        {
            return true;
        }
    }

    return false;
}

function getElementsByClass (searchClass,node,tag)
{
    var classElements = [];
    if ( node == null )
    node = document;
    if ( tag == null )
    tag = '*';
    var els = node.getElementsByTagName(tag);
    var elsLen = els.length;
    var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
    for (i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
}

(function (window, undefined) {
    var html_expr = /^(div|span|button|input|table|row|col|td|tr|option|select|img)/;

    function hehe (selector, context) {
        // console.log(selector, 'mxSelector')
        // console.log(context, 'mxcontext')
        var match, doc = context || document;
        // console.log(doc, 'mxDoc')
        // console.log(typeof(selector), 'mxTypeof(selector)')

        switch (typeof (selector))
        {
            case 'string':
            {
                var name = selector.substring(1);
                switch(selector.charAt(0)){
                    case '#':
                        return doc.getElementById(name);
                    case '.':
                        return (doc.getElementsByClassName ? doc.getElementsByClassName (name) : getElementsByClass(name, doc));
                    case '/':
                        return doc.getElementsByTagName(name);
                    default:
                        return doc.getElementsByName(selector);
                }
            }

            case 'object':
            {
                return selector;
            }

            case 'function':
            {
                hehe.funcs.push (selector);
            }
        }
    }

    hehe.funcs = [];        // The array of functions to call when the document loads
    hehe.loaded = false;    // The function have not been run yet

    // Run all registered functions in the order in which there were registered.
    // It is safe to call hehe.run() more than once: invocations after the
    // first do noting. It is safe for an initializtion function to call
    // $() to register another function
    hehe.run = function () {
        if (hehe.loaded) return;       // If we've  already run, do nothing

        for (var i = 0; i < hehe.funcs.length; i++) {
            hehe.funcs[i]();
        }

        hehe.loaded = true;         // Remember that we've already run once
        delete hehe.funcs;          // But don't remember the functions themselves.
        delete hehe.run;            // And forget about this function too!
    }

    // Register hehe.run() as the onload event handler for the window
    if (window.addEventListener) { window.addEventListener("load", hehe.run, false); }
    else if (window.attachEvent) window.attachEvent ("onload", hehe.run);
    else window.onload = hehe.run;

    hehe.service_gid = 1052078;
    hehe.ie6 = (navigator.userAgent.indexOf ('MSIE 6.') >= 0);
    hehe.ie = (navigator.userAgent.indexOf('MSIE') >= 0);

    window.hehe = window.mx = hehe;
})(window);

function sound_play(wav, swf)
{
    var player = window.snd_player;
    if(!!player)
    {
        if(!hack.ie){ player.innerHTML = ""; };
        player.parentNode.removeChild(player);
    }
    window.snd_player = (player = document.createElement(hack.ie?"embed":"bgsound"));
    player.style.cssText = "width:1px;height:1px;left:0px;top:0px;";
    player.src = (hack.ie?wav:swf);
    if(hack.ie){player.src = wav;}
    else{player.innerHTML = "<embed width='0' height='0' src='" + swf + "'></embed>";}
    document.body.appendChild(player);
}

function dom_get_item_by_name(root, tag_name, name)
{
    if(nodes = root.getElementsByTagName(tag_name))
    {
        for(node_index = 0; node_index < nodes.length; ++node_index)
        {
            node = nodes[node_index];
            if(name == node.getAttribute("name")){ return node; }
        }
    }
    return null;
}

/*-----------------prompt_ex--------------------------------------------------*/

/* title_twinkle() null clear. */
(function(){
    var oldv, newv, tm, is_new, doc = document, t = "title";
    window.title_twinkle = function(title){
        if (tm)
        {
            clearInterval (tm);
            tm = null;
            if (oldv) doc[t] = oldv;
        }

        if(title) {
            oldv = doc[t];
            doc[t] = (newv = title);
            tm = setInterval(function(){ doc[t] = (is_new = !is_new)?oldv:newv; }, 1000);
        }
    }
})();

function insert_after (node, after)
{
    if (after.nextSibling)
    {
        after.parentNode.insertBefore (node, after.nextSibling);
    }
    else
    {
        after.parentNode.appendChild (node);
    }
}

function remove_self (node)
{
    if (node && node.parentNode)
    {
        node.parentNode.removeChild (node);
    }

    return node;
}

// Get the X coordinate of the element e.
function get_x (e) {
    var x = 0;                  // Start with 0
    while (e) {                 // Start at element e
        x += e.offsetLeft;      // Add in the offset
        e = e.offsetParent;     // Add move up to the offsetParent
    }

    return x;
}

// Get the Y coordinate of the element e.
function get_y (element) {
    var y = 0;
    for (var e = element; e; e = e.offsetParent)            // Iterate the offsetParents
        y += e.offsetTop;

    // Now loop up through the ancestors of the element, looking ofr
    // any that have scrollTop set. Subtract these scrolling values from
    // the total offset. However, we must be sure to stop the loop before
    // we reach document.body, or we'll take document scrolling into account
    // and end up converting our offset to window coordinates.
    for (e = element.parentNode; e && e != document.body; e = e.parentNode)
    {
        if (e.scrollTop) y -= e.scrollTop;
    }

    // This is the Y coordinate with document-internal scrolling accounted for
    return y;
}

function viewport_width () {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function viewport_height () {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}



