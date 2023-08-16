/*
    mcookie
    depends: none
    author: chengzhiyong date:2014-08-13 action: cut from core.js
*/
/*-----------------mcookie---------------------------------------------------*/
function mcookie(name)
{
    var i, me = this, cookies, allcookies = document.cookie, cookie = null;
    me.name = name;
    me.value = "";
    if (allcookies == "") return;
    cookies = allcookies.split(';');
    for(i = 0; i < cookies.length; i++) {
        cookies[i] = cookies[i].replace(/(^\s*)/g, "");
        if (cookies[i].substring(0, name.length+1) == (name + "=")) {
            cookie = cookies[i];
            break;
        }
    }

    if(cookie == null){ return }
    me.value = decodeURIComponent(cookie.substring(name.length+1));
}

mcookie.prototype =
{
    store:function(daysToLive, path, domain, secure)
    {
        var cookie = this.name + '=' + encodeURIComponent( this.value );
        if( daysToLive && daysToLive != 0)
        {
            var expires_date = new Date();
            expires_date.setDate(expires_date.getDate() + daysToLive);
            cookie += "; expires=" + expires_date.toGMTString();
        }

        if (path) cookie += "; path=" + path;
        if (domain) cookie += "; domain=" + domain;
        if (secure) cookie += "; secure";

        document.cookie = cookie;
    },
    remove:function(path, domain, secure)
    {
        this.value = "";
        this.store( -1, path, domain, secure);
    },

    enabled:function()
    {
        if (navigator.cookieEnabled != undefined) return navigator.cookieEnabled;
        if (Cookie.enabled.cache != undefined) return Cookie.enabled.cache;
        document.cookie = "testcookie=test; max-age=10000";  // Set cookie
        var cookies = document.cookie;
        if (cookies.indexOf("testcookie=test") == -1) {
            return Cookie.enabled.cache = false;
        }
        else {
            document.cookie = "testcookie=test; max-age=0";  // Delete cookie
            return Cookie.enabled.cache = true;
        }
    }
};
/*-----------------mcookie---------------------------------------------------*/

