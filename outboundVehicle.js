const rp = require(`request-promise`)
const moment = require(`moment`)
const common = require('../config/common')
const config = common.config()
const FRT_BASE_URL = config["FRT_BASE_URL"]
const _ = require(`lodash`)
const update_stage_service = require('../services/updateStageTimings.service')

//constants
const IGP_NO = "IGP Number";
const VENDOR_NAME = "Vendor Name";
const VEHICLE_TYPE = "Vehicle Type"
const VENDOR_CODE = "Vendor Code";
const ORG_ID = "472b3c51-d8e9-4294-8a7f-a69093b505b7";
// const DUMMY_ORG_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MjAzODksInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNGRhNzNlYTctNTIyMi00NmZhLTg5NWYtMWE5ODkxYjliYmZlIiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.VOHeuCcPcvTXZ4jCDNyaqMoRIlLmwRndiHhT_F4N0eA"
// const MAIN_ORG_TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA5MDI1OTIsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNDcyYjNjNTEtZDhlOS00Mjk0LThhN2YtYTY5MDkzYjUwNWI3IiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.GnkPKO8URn1c70Us-p8-2LOuPTWKgN-SOMaaSm1jiAs";
let TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA5MDI1OTIsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiNDcyYjNjNTEtZDhlOS00Mjk0LThhN2YtYTY5MDkzYjUwNWI3IiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.GnkPKO8URn1c70Us-p8-2LOuPTWKgN-SOMaaSm1jiAs";
async function getShsByFilter(fromTime, tillTime) {
    fromTime = fromTime ?? Date.now() - (24 * 60 * 60 * 1000)
    tillTime = tillTime ?? Date.now()
    let filter = {
        "_shcf_Type": ["Outbound"],
        "__version": 2,
        "_departedfrompickup_": {
            "_nested": {
                "_path": "shipmentStages",
                "shipmentStages.tripPoint.purpose": ["Pickup"],
                "departureTime": {
                    "isTillExpression": false,
                    "isFromExpression": false,
                    "from": fromTime,
                    "till": tillTime
                }
            }
        }
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
        let notDirtyHistories = res.data
        if (stageArrivalTime) {
            notDirtyHistories = notDirtyHistories.filter(it => it.arrivalTime > stageArrivalTime)
        }
        if (stageDepartureTime) {
            notDirtyHistories = notDirtyHistories.filter(it => it.arrivalTime < stageDepartureTime)
        }
        console.log(
            "Not Dirty History of " + shId + " length " + JSON.stringify(notDirtyHistories.length)
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
    //         console.log(`Currupted History : ${JSON.stringify(history)}`)
    //         continue
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
    // console.log(reqHistories.map(it => it.plantStateName))
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
            console.log(`Currupted History : ${JSON.stringify(history)}`)
            continue
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
        reqHistories = reqHistories.filter((it) => it.departureTime < time);
    } else if (after && time) {
        reqHistories = reqHistories.filter((it) => it.arrivalTime > time);
    } else if (after) {
        reqHistories = [];
    }
    reqHistories = reqHistories.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let aggregatedTat = 0;
    for (let i = 0; i < reqHistories.length; i++) {
        let history = reqHistories[i];
        if (history.departureTime - history.arrivalTime < 0) {
            console.log(`Currupted History : ${JSON.stringify(history)}`)
            continue
        }
        aggregatedTat += history.departureTime - history.arrivalTime;
    }
    return aggregatedTat;
}

function gateInOutTime(processingShStage) {
    // let forGateOut = ["Main Gate", "Weighbridge", "Outside Parking"]
    // let forGateIn = ["Main Gate", "Weighbridge"]
    // let stateNames = afterActivity ? forGateOut : forGateIn
    // let reqHistories = histories.filter(
    //     (it) => stateNames.includes(it.plantStateName) && it.departureTime != null
    // );
    // if (afterActivity && time) {
    //     reqHistories = reqHistories.filter((it) => it.arrivalTime >= time);
    // } else if (time) {
    //     reqHistories = reqHistories.filter((it) => it.departureTime <= time);
    // } else if (afterActivity) {
    //     reqHistories = []
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

        // json["Vendor Name"] = getValueForCf(sh, VENDOR_NAME);
        // json["Vendor Code"] = getValueForCf(sh, VENDOR_CODE);
        let fleetInfo = sh.fleetInfo;
        let vehicle = fleetInfo ? fleetInfo.vehicle : null;
        json['Transporter Name'] = fleetInfo.forwardingAgent?.name ? fleetInfo.forwardingAgent.name : (fleetInfo.broker?.name ? fleetInfo.broker?.name : (fleetInfo.fleetOwner?.name ? fleetInfo.fleetOwner?.name : ""))
        json['Customer Name'] = getValueForCf(sh, 'Customer Name')

        json["Vehicle Type"] = getValueForCf(sh,VEHICLE_TYPE) ?? vehicle?.vehicleType ?? "";
        json["Vehicle Number"] =
            vehicle && vehicle.vehicleRegistrationNumber
                ? vehicle.vehicleRegistrationNumber
                : "";
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
        let plantStage = shStages.length > 0 ? shStages[0] : null;
        let stageArrivalTime = sh.creationTime
        let gateTiming = gateInOutTime(plantStage);
        let gateInTime = gateTiming.gateInTime;
        let gateOutTime = gateTiming.gateOutTime;

        //TODO : ROHIT : need to update this logic - should be dependent on current state  == "OUTSIDE PARKING" else INSIDE 
        json["Status"] =
            plantStage && plantStage.status == "AT" ? "INSIDE" : "OUTSIDE";
        json["Vehicle Reported At"] =
            plantStage &&
                plantStage.arrivalTime
                ? moment(plantStage.arrivalTime).format("DD/MM/YYYY HH:mm")
                : "";
        json["Category"] = getValueForCf(sh, "Category");
        let stageDepartureTime = (shStages[0].departureTime ? shStages[0].departureTime : Date.now())

        let getHistoryFrom = stageArrivalTime
        let getHistoryTill = stageDepartureTime
        if(ORG_ID == "4da73ea7-5222-46fa-895f-1a9891b9bbfe"){
            getHistoryFrom = gateInTime ? Math.min(stageArrivalTime,gateInTime)-(60*60*1000) : stageArrivalTime-(60*60*1000)
            getHistoryTill = gateOutTime ? Math.max(stageDepartureTime,gateOutTime)+(60*60*1000) : stageDepartureTime + (60*60*1000)
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

        let outsideParkingTat = calculateStateTAT(
            "Outside Parking",
            histories,
            true,
            false,
            gateInTime
        );
        json["Outside Parking TAT (HH:MM)"] = outsideParkingTat
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
        json["Weighbridge State TAT (Pre Loading)(HH:MM)"] = WeighbridgeTatPreLoading
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
        json["Reserve Parking Stages (Pre Loading)"] =
            reserveParkingInfoPreLoading.reserveStages;
        json["Reserve Parking TAT (Pre Loading)(HH:MM)"] =
            reserveParkingInfoPreLoading.aggregatedTat
                ? epochToHrMns(reserveParkingInfoPreLoading.aggregatedTat)
                : "";
        json["Loading State Name"] = processingState;
        json["Loading State In Time"] = activityStartTime
            ? moment(activityStartTime).format("DD/MM/YYYY HH:mm")
            : "";
        json["Loading State Out Time"] = activityEndTime
            ? moment(activityEndTime).format("DD/MM/YYYY HH:mm")
            : "";
        json["Loading State TAT (HH:MM)"] = actualActivityTat
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
        json["Weighbridge State TAT (Post Loading )(HH:MM)"] = weighBridgePostLoading
            ? epochToHrMns(weighBridgePostLoading)
            : "";

        let afterReserveTime = activityStartTime
        let reserveParkingInfoPostLoading = reserveParkingTAT(
            processingState,
            histories,
            false,
            true,
            afterReserveTime
        );
        json["Reserve Parking Stages (Post Loading)"] =
            reserveParkingInfoPostLoading.reserveStages;
        json["Reserve Parking TAT (Post Loading)(HH:MM)"] =
            reserveParkingInfoPostLoading.aggregatedTat
                ? epochToHrMns(reserveParkingInfoPostLoading.aggregatedTat)
                : "";

        if (!gateOutTime) {
            gateOutTime = (plantStage.status == "COMPLETED") && (activityEndTime || activityStartTime) ? plantStage.departureTime : null
        }
        json["Plant Out Date Time"] = gateOutTime
            ? moment(gateOutTime).format("DD/MM/YYYY HH:mm")
            : "";
        json["Plant TAT (HH:MM)"] =
            gateInTime && gateOutTime ? epochToHrMns(gateOutTime - gateInTime) : "";

    } catch (e) {
        console.log(`Cathced Error in producing json : ${e.message}`);
    }
    return json;
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
    if(orgId == "472b3c51-d8e9-4294-8a7f-a69093b505b7"){
        TOKEN = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2ODgwMzE4MDcsInVzZXJJZCI6ImViZTU3NTFhLWEwNWItNDZiNi05MWI0LTFjMTEyYTkwZjYzOCIsImVtYWlsIjoic3V5YXNoLmt1bWFyQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTU1NTEwNzcwMCIsIm9yZ0lkIjoiNDcyYjNjNTEtZDhlOS00Mjk0LThhN2YtYTY5MDkzYjUwNWI3IiwibmFtZSI6IlN1eWFzaCAiLCJvcmdUeXBlIjoiRkxFRVRfT1dORVIiLCJpc0dvZCI6dHJ1ZSwicG9ydGFsVHlwZSI6ImJhc2ljIn0.Tu6YwexXDHMrfkPxGyWT--IB2lvCWNm2N1ZMwfcT8Yg"
        ORG_ID = orgId
    }
    let totalShs = await getShsByFilter(fromTime, tillTime);
    console.log(`Total Shs length OutBound : ${totalShs.length}`);
    let jsonArr = [];
    for (let i = 0; i < totalShs.length; i++) {
        // if (totalShs[i].shipmentStages.length < 3) {
        //     continue
        // }
        let json = await produceJsonArr(totalShs[i]);
        jsonArr.push(json);
    }
    console.log(`Total sh in report outbound ${jsonArr.length}`);
    return jsonArr
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
// module.exports = {
//     outBoundVehicleJson: task
// }

task()