let { httpGet, HmacSHA1, obj2URL } = require('../utils')

module.exports = class AliCloudClient {

    constructor(options = {}) {
        this.domain = 'alidns.aliyuncs.com/'
        this.AccessKeyId = options.AccessKeyId
        this.AccessKeySecret = options.AccessKeySecret
    }

    setParams(HTTPMethod = 'GET', options = {}, body = {}) {
        let commonParams = {
            AccessKeyId: this.AccessKeyId,
            Format: 'JSON',
            Version: '2015-01-09',
            SignatureMethod: 'HMAC-SHA1',
            Timestamp: new Date().toISOString().replace(/\.\d{3}/, ''),
            SignatureVersion: '1.0',
            SignatureNonce: new Date().getTime() + Math.floor(Math.random() * 10000),
        }

        let tmpParam = Object.assign(commonParams, options, body)
        let signatureParams = {}
        Object.keys(tmpParam).sort().forEach(key => signatureParams[key] = tmpParam[key])

        let str = HTTPMethod + "&" + encodeURIComponent("/") + "&" + encodeURIComponent(obj2URL(signatureParams, true))
        let signature = HmacSHA1(str, this.AccessKeySecret + "&")

        signatureParams.Signature = signature

        return signatureParams
    }

    get(options = {}) {
        options = this.setParams('GET', options)
        return httpGet(this.domain, options, true)
    }
}