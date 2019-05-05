const { AccessKeyId, AccessKeySecret, DomainName } = require('./config/user')

const AliCloudClient = require('./aliCloudClient')
const { getCurrentIP, dateFormat, getLastLog } = require('./utils')

let main = async function () {

    try {

        // 历史IP
        let preIPRecord = await getLastLog()
        let preIP = preIPRecord ? preIPRecord.split(' => ')[1] : ''
        // 当前IP
        let currentIP = await getCurrentIP()
        
        // 若 IP 未变, 不执行改 IP 操作
        if (preIP === currentIP) return

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
                let currentTime = dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')
                console.log(currentTime, '=>', currentIP)
            })
        }

        // 获取 RecordId
        let getRecordId = function () {

            let options = {
                Action: 'DescribeDomainRecords',
                DomainName
            }
            return aliCloudClient.get(options).then(res => {
                let Record = res.DomainRecords.Record
                return Array.isArray(Record) ? Record[0].RecordId : Record.RecordId
            })
        }

        let aliCloudClient = new AliCloudClient({
            AccessKeyId,
            AccessKeySecret,
        })
  
        let RecordId = await getRecordId()

        // 更新域映射IP
        UpdateDomainRecord(RecordId, currentIP)
    } catch (e) {
        console.error(e)
    }
}

main()
