(function (w) {
    var appendChild = Element.prototype.appendChild
    var insertBefore = Element.prototype.insertBefore
    var _events = null
    mixinEvent()

    function defineEvents (obj) {
        try {
            Object.defineProperties(obj, {
                '$emit': {
                    configurable: false,
                    writable: false,
                    value: $emit
                },
                '$on': {
                    configurable: false,
                    writable: false,
                    value: $on
                },
                '$off': {
                    configurable: false,
                    writable: false,
                    value: $off
                },
                '$once': {
                    configurable: false,
                    writable: false,
                    value: $once
                }
            })
        } catch (e) {

        }
    }
    function $on (eventStr, fn) {
        if (typeof eventStr !== 'string' || typeof fn !== 'function') {
            console.error('【参数类型错误】$on(String, Function)')
            return
        }
        if (_events[eventStr]) {
            if (Array.isArray(_events[eventStr])) {
                _events[eventStr].push(fn)
            } else {
                var old = _events[eventStr]
                _events[eventStr] = [old, fn]
            }
        } else {
            _events[eventStr] = fn
        }
    }
    function $off (eventStr, fn) {
        if (Array.isArray(eventStr)) {
            for (var i = 0; i < eventStr.length; i++) {
                $off.call(this, eventStr[i], fn)
            }
            return
        }
        if (typeof eventStr !== 'string') {
            console.error('【参数类型错误】$off(String || Array, Function)')
            return
        }
        if (!arguments.length) {
            console.warn('clear all events')
            for (var key in _events) {
                try {
                    delete _events[key]
                } catch (e) {
                    console.error('delete ' + key + ' failed.', e)
                }
            }
        }
        if (fn) {
            if (Array.isArray(_events[eventStr])) {
                for (var i = 0; i < _events[eventStr].length; i++) {
                    var cb = _events[eventStr][i];
                    if (cb === fn) {
                        _events[eventStr].splice(i, 1)
                        return
                    }
                }
            } else {
                if (_events[eventStr] === fn) {
                    _events[eventStr] = null
                }
            }
        } else {
            _events[eventStr] = null
        }
    }
    function $emit () {
        if (!arguments.length) return
        var eventStr = arguments[0]
        var args = [].slice.call(arguments, 1)

        if (Array.isArray(eventStr)) {
            for (var i = 0; i < eventStr.length; i++) {
                $emit.apply(this, [].concat(eventStr[i], args))
            }
            return
        }
        if (typeof eventStr !== 'string') {
            console.error('【参数类型错误】$emit(String || Array, Any)')
            return
        }
        if (Array.isArray(_events[eventStr])) {
            for (var i = 0; i < _events[eventStr].length; i++) {
                var fn = _events[eventStr][i];
                fn.apply(this, args)
            }
        } else {
            if (_events[eventStr]) _events[eventStr].apply(this, args);
        }
    }
    function $once (eventStr, fn) {
        if (typeof eventStr !== 'string' || typeof fn !== 'function') {
            console.error('【参数类型错误】$once(String, Function)')
            return
        }
        $on(eventStr, cb)
        function cb () {
            fn.apply(this, arguments)
            $off(eventStr, cb)
        }
    }

    function proxyEvents () {
        var events = window.parent._getEvents && window.parent._getEvents()
        if (window.parent !== window && events) {
            if (typeof Proxy !== 'undefinded' && Proxy.toString().match(/native code/)) {
                _events = new Proxy(events, {})
            } else {
                _events = events
            }
        } else {
            _events = Object.create(null)
        }
    }

    function rewriteAddDomFn () {
        Element.prototype.appendChild = function () {
            defineIframeEvents(arguments[0])
            appendChild.apply(this, arguments)
        }
        Element.prototype.insertBefore = function () {
            defineIframeEvents(arguments[0])
            insertBefore.apply(this, arguments)
        }
    }

    function defineIframeEvents (iframe) {
        if (iframe && iframe.tagName === 'IFRAME') {
            iframe.onload = function () {
                defineEvents(iframe.contentWindow)
            }
        }
    }

    function mixinEvent () {
        proxyEvents()
        rewriteAddDomFn()
        defineEvents(w)
        w._getEvents = function () {
            return _events
        }
    }
})(window)