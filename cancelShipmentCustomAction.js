const rp = require("request-promise");
const _ = require('lodash')
const FRT_PUB_BASE_URL = "http://apis.fretron.com"


async function main(input) {
    try {
        let shipmentId = input.shipmentId
        const TOKEN = `Beaer ${$event.body.token}`

        let sh = await getShipmentById(shipmentId, true)

        if(sh){    
            console.log(sh.shipmentNumber);

            if(sh.shipmentTrackingSTatus == "COMPLETED"){
                console.log("SH Already Completed")
                return
            }else{
                const cfs = input.cfs
    
                let shipment = await updateCf(shipmentId, cfs, TOKEN)
        
                let shipmentStages = shipment.shipmentStages ?? []
        
                const shipmentPayload = {
                    "shipmentId": shipmentId,
                    "updates": []
                }
                
                let currentTime  = Date.now(); 
                for (let i = 0; i < shipmentStages.length; i++) {
        
                    console.log(i);
        
                    let stage = shipmentStages[i];
                    
                    
                    if (!stage.arrivalTime) {
                        console.log(" arrivalTime time condition")
                        shipmentPayload.updates.push({
                            keyToUpdate: "arrivalTime",
                            updatedValue: currentTime,
                            stageId: stage.uuid
        
                        });
                    }
        
                    if (!stage.departureTime) {
                        console.log("departure time condition")
                        currentTime = currentTime + (i + 1);
                        shipmentPayload.updates.push({
                            keyToUpdate: "departureTime",
                            updatedValue: currentTime,
                            stageId: stage.uuid,
                        });
                    }
                    currentTime = currentTime + i+ 2 
                }
                if (shipmentPayload?.updates?.length) {
                    _.last(shipmentPayload.updates).markcomplete = true

                    console.log(JSON.stringify(shipmentPayload));
                    await bulkSyncApi(shipmentPayload, TOKEN)
                }
            }
        }else{
            console.log("Error in getting shipment")
        }
    }

    catch (error) {
        console.log(`Caught Error in main function: ${error.message}`);
    }
}

async function updateCf(shId, cfs, TOKEN) {
    try {
        const payload = {
            shipmentId: shId,
            updates: [
                {
                    keyToUpdate: "customfields",
                    updatedValue: cfs,
                }
            ],
        }
        let updatedSh = await bulkSyncApi(payload, TOKEN)
        return updatedSh
    } catch (error) {
        console.log(`Caught Error in updating the cf: ${error.message}`);
    }
}

async function bulkSyncApi(payload, TOKEN) {
    const url = `${FRT_PUB_BASE_URL}/shipment/v1/shipment/bulk/sync`;
    try {
        const res = await rp({
            method: "POST",
            uri: url,
            body: payload,

            headers: {
                Authorization: TOKEN,
            },
            json: true,
        });

        console.log(`Bulk Sync api response status: ${res.status}`);
        if (res.status == 200) {
            return res.data
        } else {
            console.log(`Bulk Sync api response error: ${res.error}`);
        }
    } catch (e) {
        console.log(`Caught Error in Bulk Sync api: ${e.message}`);
    }
    return null
}

async function getShipmentById(shId, skipCn) {
    try {
        let url = `${FRT_PUB_BASE_URL}/shipment/v1/admin/shipment/${shId}?skipCn=${skipCn}`
        let res = await rp({
            method: "GET",
            uri: url,
            json: true
        });
        if (res.status == 200) {
            return res.data
        } else {
            console.log(`Get shipment by id res error : ${res.error}`)
            return null
        }
    } catch (e) {
        console.log(`Catched error in get sh by id : ${e.message}`)
    }
    return null
}

try {
    await main($event)
} catch (error) {
    console.log("Error in Getting Main "+e.message)
}

const $event = {
    body: {
        "shipmentId": "1bef56d3-39c6-4a7b-9c6d-f5922ceae913",
        "cfs": [{
            "indexedValue": [],
            "fieldKey": "Delay Reason",
            "multiple": false,
            "description": "",
            "remark": "",
            "uuid": "65849fe0-64a8-4b80-8fac-1f5c62d9826c",
            "required": false,
            "accessType": null,
            "input": "string",
            "unit": "",
            "valueType": "string",
            "options": [],
            "fieldType": "text",
            "value": "Driver unavailable",
            "isRemark": false
        }],
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2ODcyNTE5NjAsInVzZXJJZCI6Ijc1Mjc3NTYyLWQ4YWQtNGM3YS05ZWYyLWVkYWIxMDA4MmQ5MSIsImVtYWlsIjoiYXR1bC5iaGF0aWFAZnJldHJvbi5jb20iLCJtb2JpbGVOdW1iZXIiOiI5ODA1MTMxNDE3Iiwib3JnSWQiOiI0OTViODcyOC1jNzYxLTRmYTctODNmZS1kYjc1YTdkNjMyMjEiLCJuYW1lIjoiQXR1bCBCaGF0aWEiLCJvcmdUeXBlIjoiRkxFRVRfT1dORVIiLCJpc0dvZCI6ZmFsc2UsInBvcnRhbFR5cGUiOiJiYXNpYyJ9.34e89RMG6j9_BXLR-x6G8oHaoTw0xhpmU3B8MrZSBpg"
    }
}
main($event.body)