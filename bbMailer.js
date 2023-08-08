/**
    Write the action you wat to perform here 
    
    Context libraries you can use are 
        1. loadsh as _
        2. request-promise as rp
        3. moment as moment
        4. All node js native function are available 
        5. FRT_PUB_BASE_URL as "http://apis.fretron.com"
    
    Built in fucntions :
        1. async sendSms(mobileNos : Array<String> , content : String)
        2. async sendEmail(emails : Array<String>, ccs :  Array<String>,subject  : String,  content : String, html : String )
        3. async _geocode(lat : number, lng : number)
        4. async getCustomeFildByName(customeFiledName : String  )
    
    Rules 
        1. use await before calling async function 
        2. don't log larg objects 
        3. try not to use require(xyz)
    
    Each execution logs are recorded with exection time of action and there is a throttling limit of total execution time for each organisation as well as individual invocation
*/

const rp = require("request-promise");

const TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2ODQzMjQxMDIsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiMDZhY2FjN2YtNTY5Ny00ZmVmLTlhNjEtZWVmNDdmNzUzNjdhIiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.5CmmBhAWnIcC-lvguHujB9B-apn0ISn2J4OmcdwfBv8"
const $event = {
    query: {
        shipmentId: "f924f616-5902-48c5-81e6-d8209e237bf9"
    }
}
const shId = $event.query.shipmentId
async function sendEmail(emails, subject, content) {
    try {
        let cc = [];
        if (emails.length > 1) {
            cc = emails.slice(1);
        }
        let reqObj = {
            to: emails[0],
            html: null,
            content: content,
            subject: subject,
            cc: cc,
            threadId: null,
        };
        let url = `https://apis.fretron.com/notification-manager/admin/email`;
        var options = {
            method: "POST",
            uri: url,
            headers: {
                "Content-Type": "application/json",
            },
            body: reqObj,
            timeout: 10000,
            json: true,
        };
        let res = await rp(options);
        console.log("res from email " + JSON.stringify(res));
    } catch (e) {
        console.log("error in sending email " + e);
    }
}

async function getFleetInfoByRnNumber(vehicleRegistrationNumber) {
    let url = `https://apis.fretron.com/partner-fleet/v2/fleet/byVehicleRn?vehicleRegistrationNumber=${vehicleRegistrationNumber}`
    try {
        let res = await rp({
            method: "GET",
            uri: url,
            headers: {
                Authorization: TOKEN
            },
            json: true
        });
        console.log(`Get fleetInfo by RnNum res status: ${res.status}`)
        if (res.status == 200) {
            return res.data
        } else {
            console.log(`Get fleetInfo by RnNum res error : ${res.error}`)
        }
    } catch (e) {
        console.log(`Catched error in getting fleetInfo by RnNum : ${e.message}`)
    }
    return null
}

async function getChargeForSh(freightId, shipment, cnId = null) {
    let url = `https://apis.fretron.com/freight-pricing/v1/condition/shipment?freightId=${freightId}&shipmentId=${shipment.uuid}`
    if (cnId) { url += `&cnIds=${cnId}` }
    try {
        let res = await rp({
            method: "POST",
            uri: url,
            headers: {
                Authorization: TOKEN
            },
            body: shipment,
            json: true
        });
        console.log(`Get fixed and perKm charge for sh ${shipment.shipmentNumber} res status : ${res.status}`)
        console.log(JSON.stringify(res.data))
        if (res.status == 200) {
            return res.data
        } else {
            console.log(`Get fixed and perKm charge for sh ${shipment.shipmentNumber} res error : ${res.error}`)
        }
    } catch (e) {
        console.log(`Catched error in getting fixed and perKm charge for sh ${shipment.shipmentNumber} : ${e.message}`)
    }
    return []
}

async function getShipmentById() {
    let url = `https://apis.fretron.com/shipment/v1/admin/shipment/${shId}?skipCn=true`;
    try {
        let res = await rp({
            method: "GET",
            uri: url,
            json: true,
        });
        if (res.status == 200) {
            return res.data;
        } else {
            console.log(`Get shipment by id ${shId} error: ${res.error}`);
        }
    } catch (e) {
        console.log(`Get shipment by id ${shId}catched err : ${e.message}`);
    }
    return null;
}

async function getBusinessPartner(uuid) {
    let url = `https://apis.fretron.com/business-partners/v2/partner/${uuid}`;
    try {
        let res = await rp({
            method: "GET",
            uri: url,
            headers: {
                Authorization: TOKEN
            },
            json: true,
        });
        if (res.status == 200) {
            return res.data;
        } else {
            console.log(`Get Business Partner by ${uuid} error: ${res.error}`);
        }
    } catch (e) {
        console.log(`Get Business Partner by ${uuid} catched err : ${e.message}`);
    }
    return null;
}

async function main() {
    try {
        let shpObj = await getShipmentById(shId)
        if (shpObj == null) { throw new Error(`Sh not found for ShId ${shId}`) }
        const shipmentNumber = shpObj.shipmentNumber;
        const vehicleRegNum = shpObj.fleetInfo.vehicle?.vehicleRegistrationNumber;
        const vehicleRegistrationNumber = vehicleRegNum?.toUpperCase().replace(/\s/g, "").trim();
        let toSendMail = false
        let subject = "BigBasket data missing i.e mandatory for generating VendorBill"
        let content = ""
        let cfsMissingArr = []
        let cfs1MissingArr = []
        //case1
        if (shpObj.fleetInfo.device?.imei === null) {
            toSendMail = true
            content += `No GPS found for the shipment ${shipmentNumber}  \n`
        }
        //case2
        let data = await getFleetInfoByRnNumber(vehicleRegistrationNumber);
        if (data == null) {
            toSendMail = true
            content += `Master missing for vehicle ${vehicleRegistrationNumber} \n`
        }
        let isGstExempted = null;
        let lineOfBusiness = null;
        let fleetType = null;
        //case 3
        for (const field of (data?.vehicle?.customFields ?? [])) {
            if (field.fieldKey === "Is GST Exempted?") {
                isGstExempted = ((field.value ?? "") == "") ? null : field.value;
            }
            else if (field.fieldKey === "Line of Business") {
                lineOfBusiness = ((field.value ?? "") == "") ? field.value : null;
            }
            else if (field.fieldKey === "Fleet Type") {
                fleetType = ((field.value ?? "") == "") ? field.value : null;
            }
        }
        if (isGstExempted === null || lineOfBusiness === null || fleetType === null) {
            if (isGstExempted === null) {
                cfsMissingArr.push("Is GST Exempted?");
            }
            if (lineOfBusiness === null) {
                cfsMissingArr.push("Line of Business");
            }
            if (fleetType === null) {
                cfsMissingArr.push("Fleet Type");
            }
            toSendMail = true
            content += `Missed custom fields ${cfsMissingArr.join()} in vehicle ${vehicleRegistrationNumber}\n`
        }
        //case4
        if (data?.vehicle) { shpObj.fleetInfo.vehicle = data.vehicle; }
        let freightId = "72121e2b-f68e-4816-b4a8-37c70dee4e7e"
        let charges = await getChargeForSh(freightId, shpObj)
        if (charges?.length == 0) {
            toSendMail = true
            content += `Charges not found for Vehicle Number:${vehicleRegistrationNumber}\n,Shipment Number:${shipmentNumber}\n `
        }
        //case5
        let bp = shpObj.fleetInfo?.broker ?? shpObj.fleetInfo?.fleetOwner ?? shpObj?.fleetInfo?.forwardingAgent
        let bpId = bp?.uuid
        let data1 = await getBusinessPartner(bpId)
        let chargeMechanism = null;
        let gstPercentage = null;
        for (const field of (data1?.customFields ?? [])) {
            if (field.fieldKey === "Charge Mechanism") {
                chargeMechanism = field.value ?? null;
            } else if (field.fieldKey === "GST%") {
                gstPercentage = field.value ?? null;
            }
        }
        console.log(`Bp Cfs ChargeMechanism : ${chargeMechanism} and GST% ${gstPercentage}`)
        if (chargeMechanism === null || chargeMechanism === "" || gstPercentage === null || gstPercentage === "") {
            if (chargeMechanism === null || chargeMechanism === "") {
                cfs1MissingArr.push("Charge Mechanism");
            }
            if (gstPercentage === null || gstPercentage === "") {
                cfs1MissingArr.push("GST%");
            }
            toSendMail = true;
            content += `Missed custom fields ${cfs1MissingArr.join()} in Business Partner ${bp.name}\n`;
        }
        let emails = ["atul.bhatia@fretron.com"]
        if (toSendMail) {
            await sendEmail(emails, subject, content)
            return "Some error in data"
        } else {
            console.log(`Success`)
            return "Success"
        }
    }
    catch (error) {
        console.log(`Some error ${error.message}`);
    }
}
main()