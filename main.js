const { AccessKeyId, AccessKeySecret, RecordId } = require('./config/user')

const AliCloudClient = require('./aliCloudClient')
const { getCurrentIP, dateFormat, getLastLog } = require('./utils')

let main = async function () {

    try {
        // 历史IP
        let preIPRecord = await getLastLog()
        let preIP = preIPRecord ? preIPRecord.split(' => ')[1] : ''
        // 当前IP
        let currentIP = await getCurrentIP()
        
        if (preIP === currentIP) return
        
        let currentTime = dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')
        console.log(currentTime, '=>', currentIP)

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
                console.log(currentIP, '=> update success')
            })
        }

        let aliCloudClient = new AliCloudClient({
            AccessKeyId,
            AccessKeySecret,
        })

        // 更新域映射IP
        UpdateDomainRecord(RecordId, currentIP)
    } catch (e) {
        console.log(e)
    }



}

main()
