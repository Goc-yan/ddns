const { LOOP_TIME } = require('./config')
const { AccessKeyId, AccessKeySecret } = require('./config/user')

const AliCloudClient = require('./aliCloudClient')
const { getIP } = require('./utils')

let timer = 0

let main = async function () {

    // 更新 DomainRecord
    let UpdateDomainRecord = function (RecordId, IP) {

        var options = {
            Action: 'UpdateDomainRecord',
            RR: '@',
            Type: 'A',
            Value: IP,
            RecordId,
        }
        return aliCloudClient.get(options).then(res => {
            console.log('success')
        })
    }

    // 获取记录
    let getRecord = function (alcc) {
        return alcc.get({
            Action: 'DescribeDomainRecords',
            DomainName: 'gocyan.cn'
        })
    }

    // 轮询方法
    let loop = async function () {

        let localIP = await getIP()

        if (localIP !== IP) {
            console.log('本地 IP 改变, 更新域名记录值')
            localIP = '59.61.100.' + (172 + ++timer)
            console.log(localIP)
            await UpdateDomainRecord(RecordId, localIP)
            console.log('域名记录值更新成功')
        }
        setTimeout(loop, LOOP_TIME * 1000)
    }

    let aliCloudClient = new AliCloudClient({
        AccessKeyId,
        AccessKeySecret,
    })
  
    // 获取 aliCloud 的记录值 ( IP, RecordId )
    let RecDomainRecordsord = await getRecord(aliCloudClient)
    let Record = RecDomainRecordsord.DomainRecords.Record[0]
    let IP = Record.Value
    let RecordId = Record.RecordId

    console.log('已获取 IP & RecordId')

    // 轮询本地 IP
    loop()
}

main()