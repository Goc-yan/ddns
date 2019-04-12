const AliCloudClient = require('./aliCloudClient')
const { AccessKeyId, AccessKeySecret } = require('./config/user')

let main = async function () {

    let aliCloudClient = new AliCloudClient({
        AccessKeyId,
        AccessKeySecret,
    })

    // 获取 RecordId
    let getRecordId = function () {

        let options = {
            Action: 'DescribeDomainRecords',
            DomainName: 'gocyan.cn'
        }
        return aliCloudClient.get(options).then(res => {
            let Record = res.DomainRecords.Record
            return Array.isArray(Record) ? Record[0].RecordId : Record.RecordId
        })
    }

    // 更新 DomainRecord
    let UpdateDomainRecord = function (RecordId) {

        var options = {
            Action: 'UpdateDomainRecord',
            RR: '@',
            Type: 'A',
            Value: '59.61.100.172',
            RecordId,
        }
        return aliCloudClient.get(options).then(res => {
            console.log('success')
        })
    }

    getRecordId()
        .then(UpdateDomainRecord)
}

main()