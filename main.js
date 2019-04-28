const { AccessKeyId, AccessKeySecret, RecordId } = require('./config/user')

const AliCloudClient = require('./aliCloudClient')
const { getCurrentIP, log, getLastLog } = require('./utils')

let main = async function () {

    let perIPRecord = await getLastLog()
    let perIP = perIPRecord ? perIPRecord.split(' => ')[1] : ''
    let currentIP = await getCurrentIP()
    
    log(currentIP)


    return 
    // 若IP相同
    if(perIP === currentIP) return 
    

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
            log(currentIP + ' => update success')
        })
    }

    let aliCloudClient = new AliCloudClient({
        AccessKeyId,
        AccessKeySecret,
    })

    // 更新域映射IP
    UpdateDomainRecord(RecordId, currentIP)

}

main()
