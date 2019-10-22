import { zaxUrl } from '../src/index'

import { log } from '../src/_utils/index'

let waitObj = {
	k: 0
}

const mixUrl = 'https://demo.com/pages/index?bizOrigin=foo&other=quz#/path/id=3?bizOrigin=bar'

describe('zaxUrl', () => {
	let keys = Object.keys(zaxUrl)
	keys.forEach(par => {
		it(`should have ${par} method`, () => {
			expect(zaxUrl).toHaveProperty(par)
			expect(zaxUrl[par]).toBeInstanceOf(Function)
		})
	})

	it(`parse`, () => {
		expect(zaxUrl.parse(mixUrl)).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: mixUrl,
			origin: 'https://demo.com',
			pathname: '/pages/index',
			port: '443',
			protocol: 'https:',
			hash: '#/path/id=3?bizOrigin=bar',
			search: '?bizOrigin=foo&other=quz'
		})

		expect(zaxUrl.parse('https://demo.com/pages/index')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/pages/index',
			origin: 'https://demo.com',
			pathname: '/pages/index',
			port: '443',
			protocol: 'https:',
			hash: '',
			search: ''
		})

		expect(zaxUrl.parse('https://demo.com/pages/index?id=1')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/pages/index?id=1',
			origin: 'https://demo.com',
			pathname: '/pages/index',
			port: '443',
			protocol: 'https:',
			hash: '',
			search: '?id=1'
		})

		expect(zaxUrl.parse('https://demo.com/pages/index#tag')).toEqual({
			host: 'demo.com',
			hostname: 'demo.com',
			href: 'https://demo.com/pages/index#tag',
			origin: 'https://demo.com',
			pathname: '/pages/index',
			port: '443',
			protocol: 'https:',
			hash: '#tag',
			search: ''
		})

		expect(zaxUrl.parse('')).toEqual({
			href: '',
			hash: '',
			search: ''
		})

		expect(zaxUrl.parse('https://demo.com:9090/pages/index#tag')).toEqual({
			host: 'demo.com:9090',
			hostname: 'demo.com',
			href: 'https://demo.com:9090/pages/index#tag',
			origin: 'https://demo.com:9090',
			pathname: '/pages/index',
			port: '9090',
			protocol: 'https:',
			hash: '#tag',
			search: ''
		})
	})

	it(`get`, () => {
		expect(zaxUrl.get(mixUrl, 'bizOrigin')).toEqual('foo')
		expect(zaxUrl.get('http://demo.com/?id=1', 'bizOrigin')).toEqual('')
	})

	it(`set`, () => {
		expect(zaxUrl.set(mixUrl, 'bizOrigin', 'baz')).toEqual('https://demo.com/pages/index?bizOrigin=baz&other=quz#/path/id=3?bizOrigin=bar')
		expect(zaxUrl.set(mixUrl, '', 'baz')).toEqual(mixUrl)
		expect(zaxUrl.set('http://demo.com/', 'foo', 'bar')).toEqual('http://demo.com/?foo=bar')
		expect(zaxUrl.set('http://demo.com', 'foo', 'bar')).toEqual('http://demo.com?foo=bar')
		expect(zaxUrl.set('http://demo.com?id=1', 'foo', 'bar')).toEqual('http://demo.com?id=1&foo=bar')
		expect(zaxUrl.set('http://demo.com/?id=1', 'foo', 'bar')).toEqual('http://demo.com/?id=1&foo=bar')
		expect(zaxUrl.set('http://demo.com?id=1#test', 'foo', 'bar')).toEqual('http://demo.com?id=1&foo=bar#test')
		expect(zaxUrl.set('http://demo.com/?id=1#test', 'foo', 'bar')).toEqual('http://demo.com/?id=1&foo=bar#test')
	})

	it(`del`, () => {
		expect(zaxUrl.del(mixUrl, 'bizOrigin')).toEqual('https://demo.com/pages/index?other=quz#/path/id=3?bizOrigin=bar')
	})

	it(`search`, () => {
		expect(zaxUrl.search(mixUrl)).toEqual({ bizOrigin: 'foo', other: 'quz' })
		expect(zaxUrl.search('https://demo.com/pages/index#/path/id=3?bizOrigin=bar')).toEqual({})
	})

	it(`hash`, () => {
		expect(zaxUrl.hash(mixUrl)).toEqual('/path/id=3?bizOrigin=bar')
		expect(zaxUrl.hash('http://demo.com/path')).toEqual('')
	})

	it(`pathKey`, () => {
		expect(zaxUrl.pathKey(mixUrl)).toEqual('index')
		expect(zaxUrl.pathKey('http://demo.com/')).toEqual('')
		expect(zaxUrl.pathKey('http://demo.com')).toEqual('')
		expect(zaxUrl.pathKey('http://demo.com', 1)).toEqual('')
		expect(zaxUrl.pathKey('http://demo.com', 0)).toEqual('')
		expect(zaxUrl.pathKey('http://demo.com/d987', 5)).toEqual('')
		expect(zaxUrl.pathKey('http://demo.com/d987', 1)).toEqual('987')
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