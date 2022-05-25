/* 
    mevt
    depends : none
    author : chengzhiyong    date : 2014-08-13  action: add denpends info
*/
var mevt = null;
(function(document){
    var s_attachEvent = "attachEvent",
        s_addEventListener = "addEventListener",
        s_detachEvent = "detachEvent",
        s_removeEventListener = "removeEventListener",
        s_preventDefault = "preventDefault",
        s_stopPropagation = "stopPropagation",
        s_fromElement = "fromElement",
        s_relatedTarget = "relatedTarget",
        v_null = null,
        
        evt_props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ");
        
        /* interface */
        mevt = 
        {        
            /* guid:1, */
            bind:function(element, type, handler)
            {
                element[s_attachEvent]?element[s_attachEvent]('on' + type, handler):(
                        (element[s_addEventListener])?element[s_addEventListener](type, handler, 0):(element['on' + type] = handler))
            },
        
            unbind:function(element, type, handler)
            {
                element[s_detachEvent]?element[s_detachEvent]('on' + type, handler):(
                        (element[s_removeEventListener])?element[s_removeEventListener](type, handler, 0):(element['on' + type] = v_null))
            },
        
            mude:function(e){ e[s_preventDefault]?e[s_preventDefault]():(e.returnValue = 0); },
            stop:function(e){ e[s_stopPropagation]?e[s_stopPropagation]():(e.cancelBubble = true); },
        
            fix:function(old_e)
            {
                var n, e = {}, target = old_e.target, i = evt_props.length, 
                    root = document.documentElement || document.body;
                while(i--) {
                    n = evt_props[i];
                    e[n] = old_e[n];
                }
                
                /* check if target is a textnode (safari) */ /* Fixes #1925 where srcElement might not be defined either */
                e.target = target = target?((target.nodeType === 3)?target.parentNode:target):(e.srcElement || document);
        
                n = e.fromElement;
                e[s_relatedTarget] = e[s_relatedTarget] || (n === target? e.toElement : n);/* Add relatedTarget, if necessar */
        
                if ( e.pageX == v_null && e.clientX != v_null ) {/* Calculate pageX/Y if missing and clientX/Y available */
                    e.pageX = e.clientX + root.scrollLeft - root.clientLeft;
                    e.pageY = e.clientY + root.scrollTop - root.clientTop;
                }
        
                e.metaKey = e.metaKey || e.ctrlKey;/* Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs) */
    
                if(v_null == e.which)
                {
                    /* Add which for key events */
                    n = e.charCode;
                    i = n || ((n == 0)?n:e.keyCode);
                    /* Add which for click: 1 === left; 2 === middle; 3 === right; Note: button is not normalized, so don't use it */
                    n = e.button;
                    e.which = n?(n & 1 ? 1 : ( n & 2 ? 3 : ( n & 4 ? 2 : 0 ) )):i;
                }
        
                return e;
            }
        };
})(document);
