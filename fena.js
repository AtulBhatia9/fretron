const token = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzM5MzcyNzAsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiM2U0Y2RlZTktMGIzYi00NmRkLTliOTgtZGYwZTM4YTAyNzFjIiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.BqPM-k4hmS4cBRFE4KGH40fXvvB-a7nn4eR6zYu_1Gs";

async function calculateFreightViaPrehookCalling(actionData, skipValidation) {
    let fu = actionData.freightUnits[0]
    try {
        let order = actionData.orders && actionData.orders.length > 0 ? actionData.orders[0] : null
        console.log("FU Document No- " + fu.documentNumber);

        let fuExpectedFreightPrice = fu?.lineItems[0].expectedFreightINR ?? 0
        if (fuExpectedFreightPrice > 1 && skipValidation == false) {
            console.log("Already Contains  Expected Freight " + fuExpectedFreightPrice)
            return {
                "status": 200,
                "data": {
                    "fuList": [fu],
                    "updatedKeys": []
                },
                "error": null
            }
        }

        let totalWeight = getFromCf(fu.customFields, "FU Total Weight")
        if (totalWeight) {
            return calculateFreight(fu, order)
        } else {
            // total weight not found may be some delay getting updated fu again
            console.log("Total Wt not found so fetch updated fu")
            let updatedFu = await getFuById(fu.uuid)
            if (updatedFu) {
                let fuExpectedFreightPrice = updatedFu?.lineItems[0].expectedFreightINR ?? 0
                if (fuExpectedFreightPrice > 1 && skipValidation == false) {
                    console.log("Already Contains Expected Freight " + fuExpectedFreightPrice)
                    return {
                        "status": 200,
                        "data": {
                            "fuList": [fu],
                            "updatedKeys": []
                        },
                        "error": null
                    }
                }
                return calculateFreight(updatedFu, order)
            } else {
                return {
                    "status": 400,
                    "data": null,
                    "error": "Fu Not Found"
                }
            }
        }
    } catch (error) {
        console.log("Error " + error)
        await sendAlertOnFreightUnit(fu, `Error In getting Freight : ${error}`)
        return {
            "status": 400,
            "data": null,
            "error": "Error In getting Freight : " + error
        }

    }
}

async function getFuById(uuid) {
    try {
        let res = await rp({
            uri: `${FRT_PUB_BASE_URL}/order-manager-v2/v1/admin/freight-unit/${uuid}`,
            method: "GET",
            headers: {
                "Content-Type": "Application/json",
            },
            json: true,
        });
        if (res.status == 200) {
            return res.data
        } else {
            return null
        }
    } catch (error) {
        console.log("No fu found")
        return null
    }

}

function getFromCf(cfs, key) {
    if (cfs == null) {
        return null
    } else {
        let found = cfs.find(_ => _.fieldKey == key)
        if (found) {
            return found.value
        } else {
            return null
        }
    }
}

async function calculateFreight(fu, order) {
    try {
        const applicableWeightPriceTableId = "4c39b2b6-bf9f-46f8-8488-7d2fbc7e3769"
        const freightMasterPriceTableId = "d4dcbe17-01b3-4e06-a5b8-925b1a5693d3"
        const depotToDepotPriceTableId = ""

        let totalWeight = getFromCf(fu.customFields, "FU Total Weight") ? parseFloat(getFromCf(fu.customFields, "FU Total Weight")) : 0.0
        let isCustExist = await checkIfCustomerIsCgec_Coop_Society(fu, order)
        if (isCustExist == true) {
            console.log("CGEC COOP CUSTOMER FOUND")
            return await updateInFreightUnitForCGEP_CUstomer(fu, totalWeight)

        } else {
            if (totalWeight != 0.0) {

                let expectedFreight = 0.0

                // fetch applicable weight according to policy
                let applicableChargeWeightCharges = await getChargesForFu(fu, applicableWeightPriceTableId, "default")
                if (applicableChargeWeightCharges && applicableChargeWeightCharges.length > 0) {
                    console.log("Total Charge Length :" + applicableChargeWeightCharges.length)

                    for (let i = 0; i < applicableChargeWeightCharges.length; i++) {

                        let charge = applicableChargeWeightCharges[i]

                        let isCalculated = false
                        let approvedWeight = 0.0

                        if (charge.rateUnit != "Fixed") {
                            isCalculated = true
                            approvedWeight = charge.rate
                        } else {
                            approvedWeight = charge.amount
                        }

                        console.log("Approved Weight: " + approvedWeight + " Type :" + isCalculated)

                        // fetch approved freight from master table
                        if (approvedWeight != null && approvedWeight != 0) {

                            // setting approved weight to freight unit custom fields
                            let cfValue
                            if (approvedWeight < 2) {
                                cfValue = `${approvedWeight}MT`
                            } else if (approvedWeight <= 9) {
                                cfValue = `0${approvedWeight}MT`
                            } else {
                                cfValue = `${approvedWeight}MT`
                            }

                            let cfPayload = {
                                "indexedValue": null,
                                "fieldKey": "ApprovedWeight",
                                "multiple": false,
                                "description": "",
                                "remark": "",
                                "uuid": null,
                                "required": false,
                                "accessType": null,
                                "input": "string",
                                "unit": "",
                                "valueType": "string",
                                "options": [],
                                "fieldType": "text",
                                "value": cfValue,
                                "isRemark": false
                            }
                            console.log("Approved Weight CF Value : " + cfPayload.value)

                            if (fu.customFields == null) fu.customFields = []

                            fu.customFields.push(cfPayload)


                            let tableId = null
                            let orderType = getFromCf(order.customFields, "Order Type")

                            if (orderType === "STO") {
                                tableId = depotToDepotPriceTableId
                            } else {
                                tableId = freightMasterPriceTableId
                            }

                            let approvedFreight = await getChargesForFu(fu, tableId, "default")

                            if (approvedFreight) {

                                let rate1 = approvedFreight.find(_ => _.name == "Approved Freight_1").amount
                                let rate2 = approvedFreight.find(_ => _.name == "Approved Freight_2").amount

                                console.log("Found Rates From Master Table Rate1: " + rate1 + "  Rate2: " + rate2)

                                if (rate1 && rate1 != 0.0) {
                                    if (approvedWeight != 0.0) {

                                        if (isCalculated) {
                                            let perMtRate = rate1 / approvedWeight

                                            expectedFreight = perMtRate * totalWeight
                                            if (expectedFreight > rate2) {
                                                expectedFreight = rate2
                                            }


                                            console.log("now expected freight for calculated type : " + expectedFreight)

                                        } else {
                                            expectedFreight = rate1
                                            if (expectedFreight > rate2) {
                                                expectedFreight = rate2
                                            }
                                            console.log("now expected freight for fixed type : " + expectedFreight)
                                        }
                                    } else {
                                        console.log("approved weight is zero ")
                                        break;
                                    }
                                } else {
                                    console.log("no rate found")

                                }

                            }
                            else {
                                console.log("No approved freight found in master ")

                            }

                            if (expectedFreight != 0.0) {
                                let toBeUpdatedLineItems = fu.lineItems[0]
                                toBeUpdatedLineItems.expectedFreightINR = Math.ceil(expectedFreight)
                                // toBeUpdatedLineItems.freightType = "perVehicle"

                                console.log("Expected Freight Inr: " + toBeUpdatedLineItems.expectedFreightINR)

                                fu.lineItems = [toBeUpdatedLineItems]
                                return {
                                    "status": 200,
                                    "data": {
                                        "fuList": [fu],
                                        "updatedKeys": ["lineItems.expectedFreightINR", "_cfs_ApprovedWeight"]
                                    },
                                    "error": null
                                }
                            }
                            else {
                                await sendAlertOnFreightUnit(fu, "No Expected Freight Found")

                                return {
                                    "status": 400,
                                    "data": null,
                                    "error": "No Expected Freight Found"
                                }
                            }
                        } else {
                            console.log("Checking another charge")
                        }
                    }
                }
                else {
                    console.log("no applicable weight found")
                    await sendAlertOnFreightUnit(fu, "No Applicable Weight Found")
                    return {
                        "status": 400,
                        "data": null,
                        "error": "No Applicable Weight Found"
                    }
                }


            } else {
                console.log("Total Weight is 0 or no cfs found from FU Total Weight")
                await sendAlertOnFreightUnit(fu, "Total Weight is Zero")
                return {
                    "status": 400,
                    "data": null,
                    "error": "Total Weight is 0 or no cfs found from FU Total Weight"
                }

            }
        }
    } catch (error) {
        console.log("Error in fetching freight amount : " + error.message)
        return {
            "status": 400,
            "data": null,
            "error": "Error in fetching freight amount : " + error.message
        }
    }
}

async function getChargesForFu(freightUnit, priceTableId, resolveBy) {
    try {
        let res = await rp({
            uri: `${FRT_PUB_BASE_URL}/freight-pricing/v1/condition/freightUnit/value/v2?priceTableId=${priceTableId}&resolveBy=${resolveBy}`,
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                Authorization: token,
            },
            body: freightUnit,
            json: true,
        });

        if (res.status == 200) {
            return res.data
        } else {
            console.log("error: " + res.error)
            return null
        }

    } catch (error) {
        console.log(error)
        return null
    }
}

async function sendAlertOnFreightUnit(fu, title) {
    let payload = {
        "freightUnitId": fu.uuid,
        "lineItemId": fu.lineItems[0].uuid,
        "alert": {
            "closedBy": null,
            "createdAt": Date.now(),
            "issueId": null,
            "createdBy": "system",
            "snoozTime": null,
            "description": title,
            "type": "freight.unit.allocate.transporter.event",
            "status": "Confirm"
        }
    }

    try {
        let url = `${FRT_PUB_BASE_URL}/order-manager-v2/freight-units/v1/alert`
        console.log(url)
        let res = await rp({
            method: "POST",
            uri: url,
            json: true,
            body: payload,
            headers: {
                "Content-Type": "Application/json",
                "Authorization": token,
            }
        });
        if (res.status == 200) {
            console.log("Alert Added In Dispatch")
            return res.data
        } else {
            console.log(`Error in genearting alert on system  ${res.error}`)
            return null
        }
    } catch (e) {
        console.log(`Catched error in generating alert on system ${e.message}`)
    }
    return null
}

async function checkIfCustomerIsCgec_Coop_Society(fu, order) {
    if (order) {
        console.log("Order No " + order.orderNumber + "External Id " + order.externalId)
        if (order.customer.name == "C.G.E.C.COOP.SOCIETY-DELHI") {
            return true
        }
    } else {
        let orderId = fu.lineItems[0].salesOrderMappings?.[0]?.orderId
        if (orderId) {
            let updatedOrder = await getOrderById(order)
            if (updatedOrder) {
                console.log("Order No " + updatedOrder.orderNumber + "External Id " + updatedOrder.externalId)
                if (updatedOrder.customer.name == "C.G.E.C.COOP.SOCIETY-DELHI") {
                    return true
                }
            }
        }
    }
    return false
}

function getFreightCostFor_CGEP_Coop_customer(totalWt) {
    let applicableWt = 0
    let isCalculated = false
    if (totalWt >= 2 && totalWt < 3) {
        applicableWt = 3
    } else if (totalWt >= 3 && totalWt < 4.99) {
        applicableWt = 3
        isCalculated = true
    } else if (totalWt >= 5 && totalWt < 7.99) {
        applicableWt = 5
        isCalculated = true
    }

    let rates = {
        0: 0,
        3: 3400,
        5: 4900
    }
    let expectedFreight = -1
    let rate = rates[applicableWt]
    if (rate == 0) {
        console.log("No rate found for customer CGEP COOP")
    } else {
        if (isCalculated) {
            let perMtRate = rate / applicableWt

            expectedFreight = perMtRate * totalWt
            if (applicableWt == 3) {
                if (expectedFreight > rates[5]) {
                    expectedFreight = rates[5]
                }
            }
            console.log("now expected freight for calculated type : " + expectedFreight)

        } else {
            expectedFreight = rate
            if (applicableWt == 3) {
                if (expectedFreight > rates[5]) {
                    expectedFreight = rate[5]
                }
            }
            console.log("now expected freight for fixed type : " + expectedFreight)
        }
    }
    return expectedFreight
}

async function updateInFreightUnitForCGEP_CUstomer(fu, totalWt) {
    let expectedFreight = getFreightCostFor_CGEP_Coop_customer(totalWt)
    console.log("Expected Freight For CGEC COOP Customer " + expectedFreight)

    if (expectedFreight > -1) {
        let toBeUpdatedLineItems = fu.lineItems[0]
        toBeUpdatedLineItems.expectedFreightINR = Math.ceil(expectedFreight)
        // toBeUpdatedLineItems.freightType = "perVehicle"

        fu.lineItems = [toBeUpdatedLineItems]

        return {
            "status": 200,
            "data": {
                "fuList": [fu],
                "updatedKeys": ["lineItems.expectedFreightINR"]
            },
            "error": null
        }
    } else {
        await sendAlertOnFreightUnit(fu, "No Applicable Freight Found")

        return {
            "status": 400,
            "data": null,
            "error": "No Applicable Freight Found"
        }
    }
}

async function getOrderById(uuid) {
    let res = await rp({
        uri: `${FRT_PUB_BASE_URL}/order-manager-v2/sales-orders/v1/order/${uuid}`,
        method: "GET",
        headers: {
            Authorization: token,
        },
        json: true,
    });
    if (res.status == 200) {
        return res.data
    } else {
        return null
    }
}

try {
    let actionData = $event.body.actionData
    // console.log(JSON.stringify(actionData))

    let meta = $event.body?.meta ?? null
    let skipValidation = meta ? meta.skipFreightCheck : false

    console.log("Skip Validation " + skipValidation)
    let res = await calculateFreightViaPrehookCalling(actionData, skipValidation)
    console.log("Res status : " + res.status + " Res Error : " + res.error)
    return res
    // return  {
    //     "status": 200,
    //     "data": {
    //         "fuList": [ actionData.freightUnits[0]],
    //         "updatedKeys": ["lineItems.expectedFreightINR"]
    //     },
    //     "error": null
    // }
}
catch (error) {
    console.log("Error: " + error)
    return {
        "status": 200,
        "data": {
            "fuList": [$event.body.actionData.freightUnits[0]],
            "updatedKeys": ["lineItems.expectedFreightINR"]
        },
        "error": null
    }
}