let crypto = require("crypto")
let http = require('http')

let HmacSHA1 = function (str, key) {
    return crypto.createHmac('sha1', key).update(str).digest('base64')
}

let obj2URL = function (obj, encode) {

    let strAry = []
    for (let key in obj) {
        if (encode) {
            strAry.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
        } else {
            strAry.push(key + "=" + obj[key])
        }
    }
    return strAry.join('&')
}

let get = function (url, params) {

    let list = []
    for (let key in params) {
        list.push(key + '=' + encodeURIComponent(params[key]))
    }

    url = `http://${url}?${list.join('&')}`

    http.get(url, (res) => {

        const { statusCode } = res

        let error
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`)
        }
        if (error) {
            console.error(error.message)
            res.resume()
            return
        }

        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData)
                console.log(parsedData)
            } catch (e) {
                console.error(e.message)
            }
        })



    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`)
    })
}

class AliCloudClient {

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

        this.options = signatureParams
    }

    get() {
        get(this.domain, this.options)
    }
}

let aliCloudClient = new AliCloudClient({
    AccessKeyId: 'LTAIHExHtCOnIlMW',
    AccessKeySecret: 'eooozhRB7EOU0GECxcQ1c7PHCNUoeH',
})

var options = {
    Action: 'UpdateDomainRecord',
    RecordId: '16995417818096640',
    RR: '@',
    Type: 'A',
    Value: '59.61.100.172',
}

aliCloudClient.setParams('GET', options)
aliCloudClient.get()