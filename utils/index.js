const http = require('http')
const crypto = require("crypto")
const fs = require('fs')
const path = require('path')

const httpGet = function (url, options = {}, encode = false) {

    let urlParams = obj2URL(options, encode)

    urlParams = urlParams ? `?${urlParams}` : ''

    url = `http://${url}${urlParams}`

    return new Promise((resolve, reject) => {

        http.get(url, res => {

            const {
                statusCode
            } = res

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

const getCurrentIP = function () {
    return httpGet('ident.me')
}

const dateFormat = function (date = new Date(), format) {
    var str = format || 'YYYY-MM-DD hh:mm:ss'
    var Week = ['日', '一', '二', '三', '四', '五', '六']

    str = str.replace(/yyyy|YYYY/, date.getFullYear())
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100))
    str = str.replace(/MM/, date.getMonth() > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1))
    str = str.replace(/M/g, date.getMonth())
    str = str.replace(/w|W/g, Week[date.getDay()])

    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate())
    str = str.replace(/d|D/g, date.getDate())

    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours())
    str = str.replace(/h|H/g, date.getHours())
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes())
    str = str.replace(/m/g, date.getMinutes())

    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds())
    str = str.replace(/s|S/g, date.getSeconds())

    return str
}

const getLastLog = function () {

    // var ipPattern = /(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}/
    var pattern = / =\> (2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}/

    let data = '', lineNum = 0
    let file_path = path.resolve(__dirname, '..', 'ip_log.txt')
    let isExists = fs.existsSync(file_path)

    // 若不存在
    if (!isExists) return null

    data = fs.readFileSync(file_path, 'utf-8').split('\n')
    let index = data.length - 1

    
    for (let i = index; i > 0; i--) {
        let currentLine = data[i]
        if (pattern.test(currentLine)) return currentLine
    }

    return null
}

module.exports = {
    httpGet,
    HmacSHA1,
    obj2URL,
    getCurrentIP,
    dateFormat,
    getLastLog
}