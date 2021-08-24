import zaxUrl, { parse, get, set, del, search, hash, pathKey, basename, extname, pathmain } from '../src/index'

import { log } from '../src/_utils/index'

const mixUrl = 'https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar'

describe('zaxUrl', () => {
	let keys = Object.keys(zaxUrl)

	keys.forEach(par => {
		it(`should have ${par} method`, () => {
			expect(zaxUrl).toHaveProperty(par)
			expect(zaxUrl[par]).toBeInstanceOf(Function)
		})
	})

	beforeEach(() => {
		// const location = window.location
		// delete global['window']['location']
		// global['window']['location'] = Object.assign({}, { ...location, href: 'http://localhost' })
	})

	it(`parse`, () => {
		expect(parse(mixUrl)).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: mixUrl,
			origin: 'https://demo.com',
			pathname: '/foo/index',
			port: '443',
			protocol: 'https:',
			hash: '#/path/id=3?bizOrigin=bar',
			search: '?bizOrigin=foo&other=quz'
		})

		expect(parse('https://demo.com/foo/index')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/foo/index',
			origin: 'https://demo.com',
			pathname: '/foo/index',
			port: '443',
			protocol: 'https:',
			hash: '',
			search: ''
		})

		expect(parse('https://demo.com/foo/index?id=1')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/foo/index?id=1',
			origin: 'https://demo.com',
			pathname: '/foo/index',
			port: '443',
			protocol: 'https:',
			hash: '',
			search: '?id=1'
		})

		expect(parse('https://demo.com/foo/index#tag')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/foo/index#tag',
			origin: 'https://demo.com',
			pathname: '/foo/index',
			port: '443',
			protocol: 'https:',
			hash: '#tag',
			search: ''
		})

		expect(parse('')).toEqual({
			href: '',
			hash: '',
			search: '',
			pathname: ''
		})

		// wechat miniprograme path
		expect(parse('pages/main/index')).toEqual({
			hash: '',
			host: 'localhost',
			hostname: 'localhost',
			href: 'http://localhost/pages/main/index',
			origin: 'http://localhost',
			pathname: '/pages/main/index',
			port: '80',
			protocol: 'http:',
			search: ''
		})

		// wechat miniprograme path
		expect(parse('/pages/main/index')).toEqual({
			hash: '',
			host: 'localhost',
			hostname: 'localhost',
			href: 'http://localhost/pages/main/index',
			origin: 'http://localhost',
			pathname: '/pages/main/index',
			port: '80',
			protocol: 'http:',
			search: ''
		})

		// wechat miniprograme path
		expect(parse('index')).toEqual({
			hash: '',
			host: 'localhost',
			hostname: 'localhost',
			href: 'http://localhost/index',
			origin: 'http://localhost',
			pathname: '/index',
			port: '80',
			protocol: 'http:',
			search: ''
		})

		expect(parse('https://demo.com:9090/index#tag')).toEqual({
			host: 'demo.com:9090',
			hostname: 'demo.com',
			href: 'https://demo.com:9090/index#tag',
			origin: 'https://demo.com:9090',
			pathname: '/index',
			port: '9090',
			protocol: 'https:',
			hash: '#tag',
			search: ''
		})
	})

	it(`get`, () => {
		expect(get(mixUrl, 'bizOrigin')).toEqual('foo')
		expect(get('http://demo.com/?id=1', 'bizOrigin')).toEqual('')
		expect(get('http://demo.com/?id=1', 'id')).toEqual('1')
		expect(get('http://demo.com/?id=1', '')).toEqual('')
		expect(get('', '')).toEqual('')
		expect(get('')).toEqual('')
		expect(get('http://demo.com/?id=false', 'id')).toEqual('false')
		expect(get('http://demo.com/?id=0', 'id')).toEqual('0')
		expect(get('http://demo.com/?id=undefined', 'id')).toEqual('undefined')
		expect(get('http://demo.com/?id=false', 'id')).toEqual('false')

		let url = 'http://demo.com/?id=1'
		Object.defineProperty(window, 'location', {
			value: {
				href: url
			}
		})

		expect(window.location.href).toEqual(url)

		expect(get('id')).toEqual('1')

		Object.defineProperty(window.location, 'href', {
			writable: true,
			value: ''
		})
		expect(get('id')).toEqual('')
	})

	it(`set`, () => {
		expect(set(mixUrl, 'bizOrigin', 'baz')).toEqual('https://demo.com/foo/index?bizOrigin=baz&other=quz#/path/id=3?bizOrigin=bar')
		expect(set(mixUrl, '', 'baz')).toEqual(mixUrl)
		expect(set('http://demo.com/', 'foo', 'bar')).toEqual('http://demo.com/?foo=bar')
		expect(set('http://demo.com', 'foo', 'bar')).toEqual('http://demo.com?foo=bar')
		expect(set('http://demo.com?id=1', 'foo', 'bar')).toEqual('http://demo.com?id=1&foo=bar')
		expect(set('http://demo.com/?id=1', 'foo', 'bar')).toEqual('http://demo.com/?id=1&foo=bar')
		expect(set('http://demo.com?id=1#test', 'foo', 'bar')).toEqual('http://demo.com?id=1&foo=bar#test')
		expect(set('http://demo.com/?id=1#test', 'foo', 'bar')).toEqual('http://demo.com/?id=1&foo=bar#test')
		expect(set('http://demo.com/?id=1#test', 'foo')).toEqual('http://demo.com/?id=1#test')

		expect(set('http://demo.com/?id=1#test', { k: 1, v: 't' })).toEqual('http://demo.com/?id=1&k=1&v=t#test')
		expect(set('http://demo.com/', { k: 1, v: 't' })).toEqual('http://demo.com/?k=1&v=t')
		expect(set('http://demo.com', { k: 1, v: 't' })).toEqual('http://demo.com?k=1&v=t')

		expect(set('/pages/home/index/?id=1', { k: 1, v: 't' })).toEqual('/pages/home/index/?id=1&k=1&v=t')
		expect(set('/pages/home/index/', { k: 1, v: 't' })).toEqual('/pages/home/index/?k=1&v=t')
		expect(set('/pages/home/index', { k: 1, v: 't' })).toEqual('/pages/home/index?k=1&v=t')
		expect(set('/pages/home/index', { k: 1, v: '' })).toEqual('/pages/home/index?k=1')

		expect(set('/pages/home/index', { k: 1, v: 0 })).toEqual('/pages/home/index?k=1&v=0')
		expect(set('/pages/home/index', { k: 1, v: false })).toEqual('/pages/home/index?k=1&v=false')
		expect(set('/pages/home/index', { k: 1, v: undefined })).toEqual('/pages/home/index?k=1')
		expect(set('/pages/home/index', { k: 1, v: null })).toEqual('/pages/home/index?k=1')

		expect(set('/pages/home/index', { v: 0 })).toEqual('/pages/home/index?v=0')
		expect(set('/pages/home/index', { v: false })).toEqual('/pages/home/index?v=false')
		expect(set('/pages/home/index', { v: undefined })).toEqual('/pages/home/index')
		expect(set('/pages/home/index', { v: null })).toEqual('/pages/home/index')

		expect(set('/pages/home/index', { v1: 0, v2: false, v3: undefined, v4: null })).toEqual('/pages/home/index?v1=0&v2=false')


		expect(set('http://demo.com', 'foo')).toEqual('http://demo.com')

		expect(set('https://a-uat.demo.com/p/83755233', 'accessKey', '123')).toEqual('https://a-uat.demo.com/p/83755233?accessKey=123')
		expect(
			set(
				'https://static.demo.com/website/mobile/html/public/min-program-middle.html?hidden=1&appCode=ZABXMiniApp&v=0.&type=set&accessKey=&isMiniProgram=true&openId=%253D&backUrl=https%3A%2F%2Fa-uat.demo.com%2Fp%2F83755233%3FisMiniProgram%3Dtrue%26openId%3D%253D%26appCode%3DZABXMiniApp%26wxCode%%26hidden%3D1%26realChannelId%3D5%26v%3D1572328560526%23%2F%3FbizOrigin%3Dxcxsy_tj',
				'accessKey',
				'123'
			)
		).toEqual(
			'https://static.demo.com/website/mobile/html/public/min-program-middle.html?hidden=1&appCode=ZABXMiniApp&v=0.&type=set&accessKey=123&isMiniProgram=true&openId=%253D&backUrl=https%3A%2F%2Fa-uat.demo.com%2Fp%2F83755233%3FisMiniProgram%3Dtrue%26openId%3D%253D%26appCode%3DZABXMiniApp%26wxCode%%26hidden%3D1%26realChannelId%3D5%26v%3D1572328560526%23%2F%3FbizOrigin%3Dxcxsy_tj'
		)
	})

	it(`del`, () => {
		expect(del(mixUrl, 'bizOrigin')).toEqual('https://demo.com/foo/index?other=quz#/path/id=3?bizOrigin=bar')
	})

	it(`search`, () => {
		expect(search(mixUrl)).toEqual({ bizOrigin: 'foo', other: 'quz' })
		expect(search('https://demo.com/foo/index#/path/id=3?bizOrigin=bar')).toEqual({})
	})

	it(`hash`, () => {
		expect(hash(mixUrl)).toEqual('/path/id=3?bizOrigin=bar')
		expect(hash('http://demo.com/path')).toEqual('')
	})

	it(`pathKey`, () => {
		expect(pathKey(mixUrl)).toEqual('index')
		expect(pathKey('')).toEqual('')
		expect(pathKey('.')).toEqual('')
		expect(pathKey('http://demo.com/')).toEqual('')
		expect(pathKey('http://demo.com')).toEqual('')
		expect(pathKey('http://demo.com', 1)).toEqual('')
		expect(pathKey('http://demo.com', 0)).toEqual('')
		expect(pathKey('http://demo.com/d987', 5)).toEqual('')
		expect(pathKey('http://demo.com/d987', 1)).toEqual('987')

		expect(pathKey('http://demo.com/foo/bar/doo/d987', 5)).toEqual('')
		expect(pathKey('http://demo.com/foo/bar/doo/d987', 1)).toEqual('987')


	})

	it(`basename`, () => {
		expect(basename(mixUrl)).toEqual('index')
		expect(basename('https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('index')
		expect(basename('https://demo.com/foo/index.html?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('index.html')
		expect(basename('https://demo.com/log.txt?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('log.txt')
		expect(basename('index')).toEqual('index')
		expect(basename('log.txt')).toEqual('log.txt')
		expect(basename('')).toEqual('')
	})

	it(`extname`, () => {
		expect(extname(mixUrl)).toEqual('')
		expect(extname('https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('')
		expect(extname('https://demo.com/foo/index.html?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('.html')
		expect(extname('https://demo.com/log.txt?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('.txt')
		expect(extname('index')).toEqual('')
		expect(extname('http://demo.com/.txt')).toEqual('.txt')
		expect(extname('http://demo.com')).toEqual('')
		expect(extname('log.txt')).toEqual('.txt')
		expect(extname('.txt')).toEqual('.txt')
		expect(extname('.')).toEqual('')
		expect(extname('')).toEqual('')
	})

	it(`pathmain`, () => {
		expect(pathmain(mixUrl)).toEqual('/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')
		expect(pathmain('https://demo.com/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')).toEqual('/foo/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar')
		expect(pathmain('http://demo.com/d987')).toEqual('/d987')
		expect(pathmain('http://demo.com/d987/dax')).toEqual('/d987/dax')
	})
})

describe('log', () => {
	it('should invoke success', () => {
		let res = log('test')
		expect(log).toBeInstanceOf(Function)
		expect(res).toBeTruthy()
	})

	it('should return a function', () => {
		let res = log('test')
		expect(log).toBeInstanceOf(Function)
		expect(res).toBeTruthy()
		expect(res).toBeInstanceOf(Function)

		let res2 = log('test', 'extra param')
		expect(log).toBeInstanceOf(Function)
		expect(res2).toBeTruthy()
		expect(res2).toBeInstanceOf(Function)

		let res3 = log()
		expect(res3).toBeTruthy()
		expect(res3).toBeInstanceOf(Function)
	})
})
