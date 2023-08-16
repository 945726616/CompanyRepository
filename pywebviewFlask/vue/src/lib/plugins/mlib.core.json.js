/*
    meval, mmerge
    depends : none

    author: chengzhiyong date:2014-08-13 action:cut from core.js
*/

/* mining lib js */
function meval(s){ try{return eval("(" + s + ")"); }catch(e){return null;} }

function mmerge(d, s)
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
                if (((o = d[n]) == undefined) || (null == o)){ d[n] = (o = {}); }
                mmerge(o, v);
            }
        }
    }
    return d;
}
