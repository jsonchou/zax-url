/**
 * Url modules.
 * @module zaxUrl
 * @author jsonchou
 * @description support server & client & miniprogram side
 * @see https://github.com/jsonchou/zax-url
 * @see https://github.com/microsoft/TypeScript/issues/25590
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var zaxUtil = {
        strToObj: function (query) {
            return query.split('&').reduce(function (sum, item) {
                var arr = item.split('=');
                arr[0] && (sum[arr[0]] = arr[1]);
                return sum;
            }, {});
        },
        objToStr: function (params) {
            return Object.keys(params)
                .reduce(function (sum, item) {
                /* istanbul ignore next */
                if (item && params[item]) {
                    /* istanbul ignore next */
                    sum.push(item + "=" + params[item]);
                }
                return sum;
            }, [])
                .join('&');
        },
        port: function (protocol) {
            /* istanbul ignore next */
            switch (protocol) {
                case 'http:':
                    return '80';
                case 'https:':
                    return '443';
                default:
                    /* istanbul ignore next */
                    return location.port || '80';
            }
        }
    };
    /**
     * get value from url search part mode
     *
     * @name get
     * @function
     * @example
     * ```js
     * get("pages/index?id=2", 'id')
     * => 2
     * ```
     * @param key {String} key
     * @param url {String} url
     * @returns {String} string of result
     */ /**
    * get value from url search part mode
    *
    * @name get
    * @function
    * @example
    * ```js
    * get('id')
    * => '' //empty string
    * ```
    * @param key {String} key
    * @returns {String} string of result
    */
    // export function get<T extends string>(key: T): T
    // export function get<T extends string>(url: T, key: T): T
    function get(url, key) {
        if (arguments.length === 1) {
            /* istanbul ignore next */
            if (typeof document !== 'undefined') {
                key = url;
                url = location.href;
            }
            else {
                //server side & miniprogram
            }
        }
        if (!url) {
            // console.log('url must be a string')
            return '';
        }
        if (!key) {
            // console.log('key must be a string')
            return '';
        }
        var searchObj = search(url);
        return searchObj[key] || '';
    }
    exports.get = get;
    /**
     *
     * set & get new url
     *
     * @example
     *
     * ```js
     * set("pages/index?id=2", {k:1,v:'t'})
     * => pages/index?id=2&k=1&v=t
     * ```
     *
     * @name set
     * @function
     * @param url {String} url
     * @param kvGroups {Record<string, string | number>} key value pairs
     * @returns {String} new url
     *
     */ /**
    *
    * set & get new url
    *
    * @example
    *
    * ```js
    * set("pages/index?id=2", 'foo','bar')
    * => pages/index?id=2&foo=bar
    * ```
    *
    * @name set
    * @function
    * @param url {String} url
    * @param key {String} key
    * @param value {String} value
    * @returns {String} new url
    *
    */
    // export function set<T extends Record<string, string | number>>(url: string, kvGroups: T): string
    // export function set<T extends string>(url: T, key: T, value?: T): T
    function set(url, key, value) {
        if (value === void 0) { value = ''; }
        if (!key) {
            return url;
        }
        var searchObj = search(url);
        if (Object.keys(key).length && key.constructor === Object) {
            Object.assign(searchObj, key);
        }
        else {
            searchObj[key] = value;
        }
        var res = zaxUtil.objToStr(searchObj);
        var hash = parse(url).hash;
        var tmp = url.replace(hash, '');
        var askIdx = tmp.indexOf('?');
        askIdx = askIdx > -1 ? askIdx : tmp.length;
        var left = url.slice(0, askIdx);
        var mid = res ? '?' + res : '';
        var right = hash;
        return left + mid + right;
    }
    exports.set = set;
    /**
     * delete key & get new url
     *
     * @example
     * ```js
     * del("pages/index?id=2", 'id')
     * => pages/index
     * ```
     *
     * @param url {String} url
     * @param key {String} key
     * @returns {String} new url
     */
    function del(url, key) {
        return set(url, key, '');
    }
    exports.del = del;
    /**
     * get key of value of url
     *
     * @example
     * ```js
     * parse("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => {
        host: 'demo.com',
        hostname: 'demo.com',
        href: mixUrl,
        origin: 'https://demo.com',
        pathname: '/index',
        port: '443',
        protocol: 'https:',
        hash: '#/path/id=3?bizOrigin=bar',
        search: '?bizOrigin=foo&other=quz'
    }
     * ```
     *
     * @param url {String} url
     * @returns {UrlObject} parse object
     */
    function parse(url) {
        if (!url) {
            // console.log('url must be a string')
            return {
                href: '',
                hash: '',
                search: '',
                pathname: ''
            };
        }
        /* istanbul ignore next */
        if (typeof document != 'undefined') {
            // client side
            var a = document.createElement('a');
            a.href = url;
            return {
                hash: a.hash,
                host: a.host || location.host,
                hostname: a.hostname || location.hostname,
                href: a.href,
                origin: a.origin,
                pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
                port: '0' === a.port || '' === a.port ? zaxUtil.port(a.protocol) : a.port,
                protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
                search: a.search || ''
            };
        } /* istanbul ignore next */
        else {
            //mini program & server side
            var hash_1 = url.slice(url.lastIndexOf('#') > -1 ? url.lastIndexOf('#') : url.length) || '';
            var tmp = url.replace(hash_1, '');
            var search_1 = tmp.slice(tmp.lastIndexOf('?') > -1 ? tmp.lastIndexOf('?') : tmp.length) || '';
            return {
                pathname: url.replace(search_1, '').replace(hash_1, ''),
                href: url,
                hash: hash_1,
                search: search_1
            };
        }
    }
    exports.parse = parse;
    /**
     * get url search part
     *
     * @example
     * ```js
     * search("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => { bizOrigin: 'foo', other: 'quz' }
     * ```
     *
     * @param url {String} url
     * @returns {IKV} url search part
     */
    function search(url) {
        var search = parse(url).search.replace('?', '');
        if (!search) {
            // console.log('no search char');
            return {};
        }
        return zaxUtil.strToObj(search);
    }
    exports.search = search;
    /**
     * get url hash part without # prefix
     *
     * @example
     * ```js
     * hash("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => /path/id=3?bizOrigin=bar
     * ```
     *
     * @param url {String} url
     * @returns {String} url hash part
     */
    function hash(url) {
        var hash = parse(url).hash.replace('#', '');
        if (!hash) {
            console.log('no hash char');
            return '';
        }
        return hash;
    }
    exports.hash = hash;
    /**
     * get last url part of key
     *
     * @example
     * ```js
     * pathKey("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => index
     *
     *
     * pathKey("https://demo.com/p123?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar",1)
     * => 123
     *
     *
     * pathKey("https://demo.com/p-123?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar",2)
     * => 123
     *
     * ```
     *
     * @param url {String} url
     * @param pos {Number} pos
     * @returns {String} key path
     */
    function pathKey(url, pos) {
        if (pos === void 0) { pos = 0; }
        var pathname = parse(url).pathname || '';
        var last = pathname.split('/').pop() || '';
        return last.slice(pos);
    }
    exports.pathKey = pathKey;
    /**
     * get extname from path
     *
     * @example
     * ```js
     * extname("/test/something/file.txt")
     * => .txt
     *
     * extname("/test/something/file")
     * => '' // empty
     *
     * ```
     *
     * @param url {String} url
     * @returns {String} extname
     */
    function extname(url) {
        var last = basename(url);
        if (last && last.indexOf('.') > -1) {
            var arr = last.split('.');
            /* istanbul ignore next */
            var ext = arr.pop() || '';
            /* istanbul ignore next */
            if (ext) {
                return '.' + ext;
            }
        }
        return '';
    }
    exports.extname = extname;
    /**
     * get basename from path
     *
     * @example
     * ```js
     * basename("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => index
     *
     * basename("https://demo.com/dairy.txt?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => dairy.txt
     * ```
     *
     * @param url {String} url
     * @returns {String} key path
     */
    function basename(url) {
        var pathname = parse(url).pathname || '';
        var last = pathname.split('/').pop();
        return last || '';
    }
    exports.basename = basename;
    /**
     * remove host and left pathname + search + hash
     *
     * @example
     * ```js
     * pathmain("https://demo.com/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
     * => /index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar
     * ```
     *
     * @param url {String} url
     * @returns {String} key path
     */
    function pathmain(url) {
        var info = parse(url);
        var pathmain = info.pathname + info.search + info.hash;
        return pathmain;
    }
    exports.pathmain = pathmain;
    exports.default = {
        parse: parse,
        get: get,
        set: set,
        del: del,
        search: search,
        hash: hash,
        pathKey: pathKey,
        basename: basename,
        extname: extname,
        pathmain: pathmain
    };
});
//# sourceMappingURL=index.js.map