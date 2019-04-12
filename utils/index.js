const http = require('http')
const crypto = require("crypto")

const httpGet = function (url, options = {}, encode = false) {

    let urlParams = obj2URL(options, encode)

    urlParams = urlParams ? `?${urlParams}` : ''

    url = `http://${url}${urlParams}`

    return new Promise((resolve, reject) => {

        http.get(url, res => {

            const { statusCode } = res

            let error
            if (statusCode !== 200) error = new Error(`Request Failed.\n'Status Code: ${statusCode}`)

            if (error) {
                console.error(error.message)
                res.resume()
                return
            }

            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', (chunk) => rawData += chunk)
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData))
                } catch (e) {
                    resolve(rawData)
                }
            })
        }).on('error', (e) => {
            reject(e.message)
        })
    })
}

const HmacSHA1 = function (str, key) {
    return crypto.createHmac('sha1', key).update(str).digest('base64')
}

const obj2URL = function (obj, encode) {

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

const getIP = function () {
    return httpGet('ident.me')
}

module.exports = {
    httpGet,
    HmacSHA1,
    obj2URL,
    getIP
}