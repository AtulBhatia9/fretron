const rp = require(`request-promise`)
const moment = require(`moment`)
const _ = require(`lodash`)
const common = require('../config/common')
const config = common.config()
const FRT_BASE_URL = config["FRT_BASE_URL"]
const update_stage_service = require('../services/updateStageTimings.service')
//constants
const IGP_NO = "IGP Number";
const VENDOR_NAME = "Vendor Name";
const VENDOR_CODE = "Vendor Code";
const MATERIAL_DESC = 'Material Description';
const PLANT = "Plant";
const PO_NO_1 = "PO No_1";
const PURCHASE_GROUP = "Purchase Group";
const MRN_NO = "MRN No";
const MRN_DATE ="MRN Date"; 
const MRN_LINEITEM_NOS = "MRN Lineitem No's";
const CHALLAN_NO = "Challan No";
const CHALLAN_DATE = "Challan Date";
const NO_OF_PACKET_1 = "No of Packet_1";
const NATURE_OF_PACKET_1 = "Nature of Packet_1";
const TRANSPORTER_GR_NO = "Transporter GR No";
const GR_DATE = "GR Date";
const ITEM_CODE_1 = "Item Code_1";
const MATERIAL_TYPE_1 = "Material Type_1";
const UNIT_1 = "UNIT_1";
const QTY_1 = "QTY_1";
const ORG_ID = "472b3c51-d8e9-4294-8a7f-a69093b505b7";
// const DUMMY_ORG_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MjAzODksInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNGRhNzNlYTctNTIyMi00NmZhLTg5NWYtMWE5ODkxYjliYmZlIiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.VOHeuCcPcvTXZ4jCDNyaqMoRIlLmwRndiHhT_F4N0eA"
// const MAIN_ORG_TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA5MDI1OTIsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNDcyYjNjNTEtZDhlOS00Mjk0LThhN2YtYTY5MDkzYjUwNWI3IiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.GnkPKO8URn1c70Us-p8-2LOuPTWKgN-SOMaaSm1jiAs";
const TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA5MDI1OTIsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNDcyYjNjNTEtZDhlOS00Mjk0LThhN2YtYTY5MDkzYjUwNWI3IiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.GnkPKO8URn1c70Us-p8-2LOuPTWKgN-SOMaaSm1jiAs";
async function getShsByFilter(fromTime, tillTime) {
    fromTime = fromTime ?? Date.now() - (24 * 60 * 60 * 1000)
    tillTime = tillTime ?? Date.now()
    let filter = {
        "__version": 2,
        "_departedfromdelivery_": {
            "_nested": {
                "_path": "shipmentStages",
                "shipmentStages.tripPoint.purpose": ["Delivery"],
                "departureTime": {
                    "isTillExpression": false,
                    "isFromExpression": false,
                    "from": fromTime,
                    "till": tillTime
                }
            }
        },
        "_shcf_Type": ["Inbound"]
    }
    console.log(filter)
    let url = `${FRT_BASE_URL}/shipment-view/shipments/v1?filters=${encodeURIComponent(
        JSON.stringify(filter)
    )}&sortBy=earliestDate&size=3000`;
    console.log(url);
    
    try {
        let res = await rp({
            method: "GET",
            uri: url,
            headers: {
                Authorization: TOKEN,
            },
            json: true,
        });
        return res;
    } catch (e) {
        console.log(`Catched Error in getting VRs from filter : ${e.message}`);
    }
    return [];
}

function getValueForCf(sh, key) {
    let shCfs = sh.customFields;
    let reqCf = shCfs.find((it) => it.fieldKey == key);
    return reqCf ? reqCf.value : "";
}

async function getHistoriesByShIds(shId, stageArrivalTime, stageDepartureTime) {
    let url = `${FRT_BASE_URL}/plant-tracking/v1/admin/processed-history?shId=${shId}&orgId=${ORG_ID}`;
    console.log(url);
    try {
        let res = await rp({
            method: "GET",
            url: url,
            json: true,
        });
        console.log(
            "History of " + shId + " length " + JSON.stringify(res.data.length)
        );
        let notDirtyHistories = res.data;
        if (stageArrivalTime) {
            notDirtyHistories = notDirtyHistories.filter(
                (it) => it.arrivalTime > stageArrivalTime
            );
        }
        if (stageDepartureTime) {
            notDirtyHistories = notDirtyHistories.filter(
                (it) => it.arrivalTime < stageDepartureTime
            );
        }
        console.log(
            "Not Dirty History of " +
            shId +
            " length " +
            JSON.stringify(notDirtyHistories.length)
        );
        return notDirtyHistories;
    } catch (e) {
        console.log(`Catched error in getting history by shIds : ${e.message}`);
    }
    return [];
}

function processingStateTAT(processingShStage) {
    //History with isDirty false
    // let reqHistories = histories.filter(
    //     (it) => it.plantStateName == processingState && it.departureTime != null
    // );
    // reqHistories = reqHistories.sort((a, b) => a.arrivalTime - b.arrivalTime);
    // let aggregatedTat = 0;
    // let actualActivityStartTime = null;
    // let actualActivityEndTime = null;
    // for (let i = 0; i < reqHistories.length; i++) {
    //     let history = reqHistories[i];
    //     if (history.departureTime - history.arrivalTime < 0) {
    //         console.log(`Currupted History : ${JSON.stringify(history)}`);
    //         continue;
    //     }
    //     if (!actualActivityStartTime) actualActivityStartTime = history.arrivalTime;
    //     actualActivityEndTime = history.departureTime;
    //     aggregatedTat += actualActivityEndTime - history.arrivalTime;
    // }
    let actualActivityStartTime = processingShStage?.actualActivityStartTime ?? null
    let actualActivityEndTime = processingShStage?.actualActivityEndTime ?? null
    let aggregatedTat = actualActivityEndTime && actualActivityStartTime ? actualActivityEndTime - actualActivityStartTime : null
    return {
        activityTat: aggregatedTat,
        activityStartTime: actualActivityStartTime,
        activityEndTime: actualActivityEndTime,
    };
}

function reserveParkingTAT(
    processingState,
    histories,
    before = false,
    after = false,
    time = null
) {
    let reqHistories = histories.filter(
        (it) =>
            ![
                "Outside Parking",
                "Main Gate",
                "Weighbridge",
                "Main Parking",
                processingState,
            ].includes(it.plantStateName) && it.departureTime != null
    );
    if (before && time) {
        reqHistories = reqHistories.filter((it) => it.departureTime <= time);
    } else if (after && time) {
        reqHistories = reqHistories.filter((it) => it.arrivalTime >= time);
    } else if (after) {
        reqHistories = [];
    }
    reqHistories = reqHistories.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let reserveStages = [];
    let aggregatedTat = 0;
    for (let i = 0; i < reqHistories.length; i++) {
        let history = reqHistories[i];
        if (history.departureTime - history.arrivalTime < 0) {
            console.log(`Currupted History : ${JSON.stringify(history)}`);
            continue;
        }
        reserveStages.push(history.stageName);
        aggregatedTat += history.departureTime - history.arrivalTime;
    }
    reserveStages = _.uniq(reserveStages)
    return {
        aggregatedTat: aggregatedTat,
        reserveStages: reserveStages.join(),
    };
}

function calculateStateTAT(
    stateName,
    histories,
    before = false,
    after = false,
    time = null
) {
    let reqHistories = histories.filter(
        (it) => it.plantStateName == stateName && it.departureTime != null
    );
    if (before && time) {
        reqHistories = reqHistories.filter((it) => it.departureTime <= time);
    } else if (after && time) {
        reqHistories = reqHistories.filter((it) => it.arrivalTime >= time);
    } else if (after) {
        reqHistories = [];
    }
    reqHistories = reqHistories.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let aggregatedTat = 0;
    for (let i = 0; i < reqHistories.length; i++) {
        let history = reqHistories[i];
        if (history.departureTime - history.arrivalTime < 0) {
            console.log(`Currupted History : ${JSON.stringify(history)}`);
            continue;
        }
        aggregatedTat += history.departureTime - history.arrivalTime;
    }
    return aggregatedTat;
}

function gateInOutTime(processingShStage) {
    // let forGateOut = ["Main Gate", "Weighbridge", "Outside Parking"];
    // let forGateIn = ["Main Gate", "Weighbridge"];
    // let stateNames = afterActivity ? forGateOut : forGateIn;
    // let reqHistories = histories.filter(
    //     (it) => stateNames.includes(it.plantStateName) && it.departureTime != null
    // );
    // if (afterActivity && time) {
    //     reqHistories = reqHistories.filter((it) => it.arrivalTime > time);
    // } else if (time) {
    //     reqHistories = reqHistories.filter((it) => it.departureTime < time);
    // } else if (afterActivity) {
    //     reqHistories = [];
    // }
    // reqHistories = reqHistories.sort((a, b) => a.arrivalTime - b.arrivalTime);
    // return reqHistories.length > 0
    //     ? afterActivity
    //         ? reqHistories[reqHistories.length - 1].arrivalTime
    //         : reqHistories[0].arrivalTime
    //     : null;
    return {
        gateInTime: processingShStage?.gateInTime ?? null,
        gateOutTime: processingShStage?.gateOutTime ?? null
    }
}

async function produceJsonArr(sh) {
    let json = {};
    try {
        sh = await ensureInPlantTAT(sh)
        json["IGP Number"] = getValueForCf(sh, IGP_NO);
        json["Shipment Number"] = sh.shipmentNumber;
        let fleetInfo = sh.fleetInfo;
        json['Transporter Name'] = fleetInfo.forwardingAgent?.name ? fleetInfo.forwardingAgent.name : (fleetInfo.broker?.name ? fleetInfo.broker?.name : (fleetInfo.fleetOwner?.name ? fleetInfo.fleetOwner?.name : ""))
        json["Vendor Name"] = getValueForCf(sh, VENDOR_NAME);
        json["Vendor Code"] = getValueForCf(sh, VENDOR_CODE);
        let vehicle = fleetInfo ? fleetInfo.vehicle : null;
        json["Vehicle Type"] =
            vehicle && vehicle.vehicleType ? vehicle.vehicleType : "";
        json["Vehicle Number"] =
            vehicle && vehicle.vehicleRegistrationNumber
                ? vehicle.vehicleRegistrationNumber
                : "";
        json['Material Description'] = getValueForCf(sh, MATERIAL_DESC)
        let driver = fleetInfo ? fleetInfo.driver : null;
        json["Driver Name"] = driver && driver.name ? driver.name : "";
        json["Driver Mobile Number"] =
            driver && driver.mobileNumber ? driver.mobileNumber : "";
        let shStages = sh.shipmentStages;
        // let plantStage = shStages.find(
        //   (it) =>
        //     (it.place && it.place.name == "IGL Gorakhpur") ||
        //     (it.hub && it.hub.name == "IGL Gorakhpur")
        // );
        let plantStage = shStages.length > 1 ? shStages[1] : null;
        let stageArrivalTime = shStages[0].departureTime;
        let stageDepartureTime = shStages[1].departureTime;
        let gateTiming = gateInOutTime(plantStage)
        let gateInTime = gateTiming.gateInTime;
        let gateOutTime = gateTiming.gateOutTime;

        json["Status"] =
            plantStage && plantStage.status == "AT" ? "INSIDE" : "OUTSIDE";
        json["Vehicle Reported At"] =
            plantStage &&
                plantStage.arrivalTime
                ? moment(plantStage.arrivalTime).format("DD/MM/YYYY HH:mm")
                : "";
        json["Category"] = getValueForCf(sh, "Category");

        let getHistoryFrom = stageArrivalTime
        let getHistoryTill = stageDepartureTime
        if(ORG_ID == "4da73ea7-5222-46fa-895f-1a9891b9bbfe"){
            getHistoryFrom = gateInTime ? Math.min(stageArrivalTime,gateInTime)-(60*60*1000) : stageArrivalTime-(60*60*1000)
            getHistoryTill = gateOutTime ? Math.max(stageDepartureTime,gateOutTime)+(60*60*1000) : stageDepartureTime+(60*60*1000)
        }
        let histories = await getHistoriesByShIds(
            sh.uuid,
            getHistoryFrom,
            getHistoryTill
        );

        let processingState = getValueForCf(sh, "ProcessingStateName");
        let processingStateTat = processingStateTAT(plantStage);
        let activityStartTime = processingStateTat.activityStartTime;
        let activityEndTime = processingStateTat.activityEndTime;
        let actualActivityTat = processingStateTat.activityTat;
        console.log(activityStartTime + " " + activityEndTime)

        let outsideParkingTat = calculateStateTAT(
            "Outside Parking",
            histories,
            true,
            false,
            gateInTime
        );
        json["Outside Parking TAT(HH:MM)"] = outsideParkingTat
            ? epochToHrMns(outsideParkingTat)
            : "";

        gateInTime = gateInTime ?? activityStartTime ?? plantStage.arrivalTime
        json["Plant In Date Time"] = gateInTime
            ? moment(gateInTime).format("DD/MM/YYYY HH:mm")
            : "";
        let WeighbridgeTatPreLoading = calculateStateTAT(
            "Weighbridge",
            histories,
            true,
            false,
            activityStartTime
        );
        json["Weighbridge State TAT (Pre Unloading)(HH:MM)"] = WeighbridgeTatPreLoading
            ? epochToHrMns(WeighbridgeTatPreLoading)
            : "";
        let mainParkingTat = calculateStateTAT(
            "Main Parking",
            histories,
            false,
            false,
            null
        );
        json["Main Parking State Tat(HH:MM)"] = mainParkingTat
            ? epochToHrMns(mainParkingTat)
            : "";
        let reserveParkingInfoPreLoading = reserveParkingTAT(
            processingState,
            histories,
            true,
            false,
            activityStartTime
        );
        json["Reserve Parking Stages (Pre Unloading)"] =
            reserveParkingInfoPreLoading.reserveStages;
        json["Reserve Parking TAT (Pre Unloading)(HH:MM)"] =
            reserveParkingInfoPreLoading.aggregatedTat
                ? epochToHrMns(reserveParkingInfoPreLoading.aggregatedTat)
                : "";
        json["Unloading State Name"] = processingState;
        json["Unloading State In Time"] = activityStartTime
            ? moment(activityStartTime).format("DD/MM/YYYY HH:mm")
            : "";
        json["Unloading State Out Time"] = activityEndTime
            ? moment(activityEndTime).format("DD/MM/YYYY HH:mm")
            : "";
        console.log(`${actualActivityTat ? epochToHrMns(actualActivityTat) : ""}`)
        json["Unloading State TAT(HH:MM)"] = actualActivityTat
            ? epochToHrMns(actualActivityTat)
            : "";

        let afterWeighingTime = activityEndTime
            ? activityEndTime
            : activityStartTime;
        let weighBridgePostLoading = calculateStateTAT(
            "Weighbridge",
            histories,
            false,
            true,
            afterWeighingTime
        );
        json["Weighbridge State TAT (Post Unloading)(HH:MM)"] = weighBridgePostLoading
            ? epochToHrMns(weighBridgePostLoading)
            : "";

        let afterReserveTime = activityStartTime;
        let reserveParkingInfoPostLoading = reserveParkingTAT(
            processingState,
            histories,
            false,
            true,
            afterReserveTime
        );
        json["Reserve Parking Stages (Post Unloading)"] =
            reserveParkingInfoPostLoading.reserveStages;
        json["Reserve Parking TAT (Post Unloading)(HH:MM)"] =
            reserveParkingInfoPostLoading.aggregatedTat
                ? epochToHrMns(reserveParkingInfoPostLoading.aggregatedTat)
                : "";

        if (!gateOutTime) gateOutTime = (plantStage.status == "COMPLETED") && (activityEndTime || activityStartTime) ? plantStage.departureTime : null;
        json["Plant Out Date Time"] = gateOutTime
            ? moment(gateOutTime).format("DD/MM/YYYY HH:mm")
            : "";
        json["Plant TAT(HH:MM)"] =
            gateInTime && gateOutTime ? epochToHrMns(gateOutTime - gateInTime) : "";

            json["Plant"] = getValueForCf(sh, PLANT);

            json["PO No_1"] = getValueForCf(sh, PO_NO_1);
    
            json["Purchase Group"] = getValueForCf(sh, PURCHASE_GROUP);
    
            json["MRN No"] = getValueForCf(sh, MRN_NO);
    
            json["MRN Date"] = getValueForCf(sh, MRN_DATE);
    
            json["MRN Lineitem No's"] = getValueForCf(sh, MRN_LINEITEM_NOS);
    
            json["Challan No"] = getValueForCf(sh, CHALLAN_NO);
    
            json["Challan Date"] = getValueForCf(sh, CHALLAN_DATE);
    
            json["No of Packet_1"] = getValueForCf(sh, NO_OF_PACKET_1);
    
            json["Nature of Packet_1"] = getValueForCf(sh, NATURE_OF_PACKET_1);
    
            json["Transporter GR No"] = getValueForCf(sh, TRANSPORTER_GR_NO);
    
            json["GR Date"] = getValueForCf(sh, GR_DATE);
    
            json["Item Code_1"] = getValueForCf(sh, ITEM_CODE_1);
    
            json["Material Type_1"] = getValueForCf(sh, MATERIAL_TYPE_1);
    
            json["UNIT_1"] = getValueForCf(sh, UNIT_1);
    
            json["Qty_1"] = getValueForCf(sh, QTY_1);      
    } catch (e) {
        console.log(`Cathced Error in producing json : ${e.message}`);
    }
    return json;
}

async function ensureInPlantTAT(sh) {
    let calculated = (sh.customFields ?? []).find(_ => _.fieldKey == "InPlantTATCalculated")?.value
    if (calculated == "Yes") {
        return sh
    }
    await update_stage_service.updateStageTimings(sh.uuid)
    let updatedSh = await update_stage_service.getShipmentById(sh.uuid)
    return (updatedSh ? updatedSh : sh)
}

function epochToHrMns(epochTime) {
    let hrsMs = epochTime - (epochTime % (1000 * 60 * 60));
    let minMs = epochTime - hrsMs;
    let hrs = hrsMs / (1000 * 60 * 60);
    let min = Math.floor(minMs / (1000 * 60));
    hrs = hrs < 10 ? `0${hrs}` : hrs;
    min = min < 10 ? `0${min}` : min;
    return hrs + ":" + min;
}

async function task(fromTime = null, tillTime = null,orgId=null) {
    let totalShs = await getShsByFilter(fromTime, tillTime);
    console.log(`Total Shs length Inbound : ${totalShs.length}`);
    let jsonArr = [];
    for (let i = 0; i < totalShs.length; i++) {
        if (totalShs[i].shipmentStages.length < 2) {
            continue
        }
        let json = await produceJsonArr(totalShs[i]);
        jsonArr.push(json);
    }
    let summaryHtml = await getSummaryHtml(totalShs)
    console.log(`Total sh in report : Inbound ${jsonArr.length}`);
    return { "jsonData": jsonArr, 'summaryHtml': summaryHtml }

    /** 
    * TODO: need to return {"jsonData":jsonArr,'summaryHtml':summaryHtml} --> Done
    Todo handle this in ResourceLevel --> Done
    1. email inbound report 
    2. download inbound report
    */
}

async function getSummaryHtml(shDataList) {

    function tatTimeCalculate(arrivalTime, departureTime) {
        let diff = departureTime ? departureTime - arrivalTime : 0

        return Math.round(diff / 3600000) //Miliseconds to Hours Conversion
    }

    console.log("-----Itterating Shipments to Create HTML-----")

    let arr = new Array()
    for (let shs of shDataList) {
        let materialCf = shs.customFields ? shs.customFields.filter(({ fieldKey }) => fieldKey == "Category") : []

        arr.push({
            "Shipment Number": shs.shipmentNumber,
            "Material": materialCf.length ? materialCf[0].value : "",
            "TAT Time": tatTimeCalculate(shs.shipmentStages[1].arrivalTime, shs.shipmentStages[1].departureTime)
        })
    }

    let gtlessThan12 = 0
    let gttwelveTo16 = 0
    let gtsixteenTo24 = 0
    let gttwentyFourTo36 = 0
    let gtthirtySixTo48 = 0
    let gtFourtyEightTo60 = 0
    let gtgreaterThan60 = 0
    let gtgrandTotal = 0

    let groupedMaterialData = _.groupBy(arr, "Material")
    let tableContent = ""
    for (let materials in groupedMaterialData) {
        let lessThan12 = 0
        let twelveTo16 = 0
        let sixteenTo24 = 0
        let twentyFourTo36 = 0
        let thirtySixTo48 = 0
        let FourtyEightTo60 = 0
        let greaterThan60 = 0
        let grandTotal = 0
        let materialArray = groupedMaterialData[materials]

        for (let data of materialArray) {
            let time = (data["TAT Time"])
            if (time < 12) {
                lessThan12 += 1
                gtlessThan12 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }
            else if (time >= 12 && time < 16) {
                twelveTo16 += 1
                gttwelveTo16 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }
            else if (time >= 16 && time < 24) {
                sixteenTo24 += 1
                gtsixteenTo24 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }
            else if (time >= 24 && time < 36) {
                twentyFourTo36 += 1
                gttwentyFourTo36 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }
            else if (time >= 36 && time < 48) {
                thirtySixTo48 += 1
                gtthirtySixTo48 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }
            else if (time >= 48 && time < 60) {
                FourtyEightTo60 += 1
                gtFourtyEightTo60 += 1
                grandTotal += 1
                gtgrandTotal += 1
            } else {
                greaterThan60 += 1
                gtgreaterThan60 += 1
                grandTotal += 1
                gtgrandTotal += 1
            }

        }

        tableContent += `
                    <tr>
                    <th style="background-color: #4AEDCE;">${materials}</th>
                    <td>${lessThan12}</td>
                    <td>${twelveTo16}</td>
                    <td>${sixteenTo24}</td>
                    <td>${twentyFourTo36}</td>
                    <td>${thirtySixTo48}</td>
                    <td>${FourtyEightTo60}</td>
                    <td>${greaterThan60}</td>
                    <td>${grandTotal}</td>
                    </tr>
    `
    }

    tableContent += `
                    <tr>
                    <th style="background-color: #4AEDCE">Grand Total</th>
                    <td>${gtlessThan12}</td>
                    <td>${gttwelveTo16}</td>
                    <td>${gtsixteenTo24}</td>
                    <td>${gttwentyFourTo36}</td>
                    <td>${gtthirtySixTo48}</td>
                    <td>${gtFourtyEightTo60}</td>
                    <td>${gtgreaterThan60}</td>
                    <td>${gtgrandTotal}</td>
                    </tr>
    `

    let html = `
            <html>
            <head>
                <style>
                table,tbody,th,td {
                border: 1px solid black;
                border-collapse: collapse;
                width: 900px;
                margin-left: auto;
                margin-right: auto;
                }
                th, td {
                padding: 2px;
                text-align: center;
                }
                </style>
                </head>
                <body>
                <table>
                <tr>
                <th style="background-color: #4AEDCE;">Category</th>
                <th style="background-color: #01BDE0;"><12 hrs</th>
                <th style="background-color: #01BDE0;">12-16 hrs</th>
                <th style="background-color: #01BDE0;">16-24 hrs</th>
                <th style="background-color: #01BDE0;">24-36 hrs</th>
                <th style="background-color: #01BDE0;">36-48 hrs</th>
                <th style="background-color: #01BDE0;">48-60 hrs</th>
                <th style="background-color: #01BDE0;">>60 hrs</th>
                <th style="background-color: #01BDE0;">Grand Total</th>
                </tr>
                ${tableContent}
                </table>
                </body>
            </html>
    `

    return html
}

// module.exports = {
//     inboundVehicleJson: task
// }

task("2023-06-09", "2023-06-29", "472b3c51-d8e9-4294-8a7f-a69093b505b7")
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.message);
  });
