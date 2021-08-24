/**
 * Url modules.
 * @module zaxUrl
 * @author jsonchou
 * @description support server & client & miniprogram side
 * @see https://github.com/jsonchou/zax-url
 * @see https://github.com/microsoft/TypeScript/issues/25590
 */

export type TypePossible = string | number | boolean | null | undefined
export type IKV = Record<string, TypePossible>

export type UrlDescriptor = {
	href: string
	hash: string
	search: string
	host?: string
	hostname?: string
	origin?: string
	pathname?: string
	port?: string
	protocol?: string
}


let zaxUtil: Record<string, any> = {
	strToObj(query: string): IKV {
		return query.split('&').reduce((sum: IKV, item: string) => {
			let arr = item.split('=')
			arr[0] && (sum[arr[0]] = arr[1])
			return sum
		}, {})
	},

	objToStr(params: IKV): string {
		return Object.keys(params)
			.reduce((sum: string[], item) => {
				/* istanbul ignore next */
				if (item) {
					if (params[item] !== null && params[item] !== undefined && params[item] !== '') {
						sum.push(`${item}=${params[item]}`)
					}
				}
				return sum
			}, [])
			.join('&')
	},

	port(protocol: string): string {
		/* istanbul ignore next */
		switch (protocol) {
			case 'http:':
				return '80'
			case 'https:':
				return '443'
			default:
				/* istanbul ignore next */
				if (typeof document !== 'undefined') {
					return location.port || '80'
				}
				return '80'
		}
	}
}


/**
 * get value from url search part mode
 *
 * @name get
 * @function
 * @example
 * ```js
 * get("pages/index?id=0&v=1", 'id')
 * => 0
 * ```
 * @param key {String} key
 * @param url {String} url
 * @returns {String} string of result
 */

export function get(url: string, key?: string): string {
	if (arguments.length === 1) {
		/* istanbul ignore next */
		if (typeof document !== 'undefined') {
			key = url
			url = location.href
		} else {
			//server side & miniprogram
		}
	}

	/* istanbul ignore next */
	if (!url) {
		// console.log('url must be a string')
		return ''
	}

	if (!key) {
		// console.log('key must be a string')
		return ''
	}

	let searchObj = search(url)
	return (searchObj[key] as string) || ''
}

/**
 *
 * set & get new url
 *
 * @example
 *
 * ```js
 * set("pages/index?id=2", { k: 1, v: "t", v1: null, v2: false, v3: undefined, v4: 0 })
 * => pages/index?id=2&k=1&v=t&v2=false&v4=0
 * ```
 *
 * @name set
 * @function
 * @param url {String} url
 * @param kvGroups {Record<string, string | number>} key value pairs
 * @returns {String} new url
 *
 */

/**
 *
 * set & get new url
 *
 * @example
 *
 * ```js
 * set("pages/foo/index?id=2", 'foo','bar')
 * => pages/foo/index?id=2&foo=bar
 * ```
 *
 * @name set
 * @function
 * @override
 * @param url {String} url
 * @param key {String} key
 * @param value {String} value
 * @returns {String} new url
 *
 */ // export function set(url: string, kvGroups: IKV): string
// export function set(url: string, key: string, value: string): string
export function set(url: string, key: string | IKV, value: TypePossible = ''): string {
	if (!key) {
		return url
	}

	let searchObj = search(url) as IKV

	if (Object.keys(key).length && key.constructor === Object) {
		Object.assign(searchObj, key as IKV)
	} else {
		searchObj[key as string] = value
	}

	let res = zaxUtil.objToStr(searchObj)

	let hash = parse(url).hash
	let tmp = url.replace(hash, '')
	let askIdx = tmp.indexOf('?')

	askIdx = askIdx > -1 ? askIdx : tmp.length

	let left = url.slice(0, askIdx)
	let mid = res ? '?' + res : ''
	let right = hash

	return left + mid + right
}


/**
 * delete key & get new url
 *
 * @example
 * ```js
 * del("pages/foo/index?id=2", 'id')
 * => pages/foo/index
 * ```
 *
 * @param url {String} url
 * @param key {String} key
 * @returns {String} new url
 */
export function del(url: string, key: string): string {
	return set(url, key, '')
}


/**
 * get key of value of url
 *
 * @example
 * ```js
 * parse("https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => {
	host: 'demo.com',
	hostname: 'demo.com',
	href: mixUrl,
	origin: 'https://demo.com',
	pathname: '/foo/index',
	port: '443',
	protocol: 'https:',
	hash: '#/path/id=3?bizOrigin=bar',
	search: '?bizOrigin=foo&other=quz'
}
 * ```
 *
 * @param url {String} url
 * @returns {UrlDescriptor} parse object
 */
export function parse(url: string): UrlDescriptor {
	if (!url) {
		// console.log('url must be a string')
		return {
			href: '',
			hash: '',
			search: '',
			pathname: ''
		}
	}
	/* istanbul ignore next */
	if (typeof document != 'undefined') {
		// client side
		let a = document.createElement('a')
		a.href = url
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
		}
	} /* istanbul ignore next */ else {
		//mini program & server side
		let hash = url.slice(url.lastIndexOf('#') > -1 ? url.lastIndexOf('#') : url.length) || ''
		let tmp = url.replace(hash, '')
		let search = tmp.slice(tmp.lastIndexOf('?') > -1 ? tmp.lastIndexOf('?') : tmp.length) || ''
		return {
			pathname: url.replace(search, '').replace(hash, ''),
			href: url,
			hash,
			search
		}
	}
}


/**
 * get url search part
 *
 * @example
 * ```js
 * search("https://demo.com/foo/ndex?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => { bizOrigin: 'foo', other: 'quz' }
 * ```
 *
 * @param url {String} url
 * @returns {IKV} url search part
 */
export function search(url: string): IKV {
	let search = parse(url).search.replace('?', '')
	if (!search) {
		// console.log('no search char');
		return {}
	}
	return zaxUtil.strToObj(search)
}


/**
 * get url hash part without # prefix
 *
 * @example
 * ```js
 * hash("https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => /path/id=3?bizOrigin=bar
 * ```
 *
 * @param url {String} url
 * @returns {String} url hash part
 */
export function hash(url: string): string {
	let hash = parse(url).hash.replace('#', '')
	if (!hash) {
		console.log('no hash char')
		return ''
	}
	return hash
}


/**
 * get last url part of key
 *
 * @example
 * ```js
 * pathKey("https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => index
 *
 *
 * pathKey("https://demo.com/foo/index/p123?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar",1)
 * => 123
 *
 *
 * pathKey("https://demo.com/foo/index/p-123?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar",2)
 * => 123
 *
 * ```
 *
 * @param url {String} url
 * @param pos {Number} pos
 * @returns {String} key path
 */
export function pathKey(url: string, pos = 0): string {
	let pathname = parse(url).pathname || ''
	let last = pathname.split('/').pop() || ''
	return last.slice(pos)
}


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
export function extname(url: string): string {
	let last = basename(url)
	if (last && last.indexOf('.') > -1) {
		let arr = last.split('.')
		/* istanbul ignore next */
		let ext = arr.pop() || ''
		/* istanbul ignore next */
		if (ext) {
			return '.' + ext
		}
	}
	return ''
}


/**
 * get basename from path
 *
 * @example
 * ```js
 * basename("https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => index
 *
 * basename("https://demo.com/foo/dairy.txt?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => dairy.txt
 * ```
 *
 * @param url {String} url
 * @returns {String} key path
 */
export function basename(url: string): string {
	let pathname = parse(url).pathname || ''
	let last = pathname.split('/').pop()
	return last || ''
}


/**
 * remove host and left pathname + search + hash
 *
 * @example
 * ```js
 * pathmain("https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar")
 * => /foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar
 * ```
 *
 * @param url {String} url
 * @returns {String} key path
 */
export function pathmain(url: string): string {
	let info = parse(url)
	let pathmain = info.pathname + info.search + info.hash
	return pathmain
}

export default {
	parse,
	get,
	set,
	del,
	search,
	hash,
	pathKey,
	basename,
	extname,
	pathmain
}
