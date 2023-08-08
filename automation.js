const rp = require("request-promise");
const token = "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzM0MjE5MTgsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiM2U0Y2RlZTktMGIzYi00NmRkLTliOTgtZGYwZTM4YTAyNzFjIiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.Es6erVa21gtwNhRI0jQ9NDcOpvNzvapxvCMaujB7oyu";
var FRT_PUB_BASE_URL = "https://apis.fretron.com";
var $event = {
    lineItems: [
    {
    optimisationBasis: "weight",
    expectedFreightINR: 100,
    stageStartTime: 1686144681728,
    purchaseLineItemId: null,
    loadTypeId: "395d8ad5-9f1b-469a-b2bd-410f23c3dbf1",
    finalizationIssues: null,
    expectedStageEndTime: null,
    utilization: 7.964817142857143,
    uuid: "f1ccfcac-2619-4fa1-b393-dd0efb5e4300",
    issues: null,
    freightType: "perVehicle",
    auctionId: null,
    alerts: [
    {
    closedBy: null,
    createdAt: 1686144568615,
    issueId: null,
    createdBy: "system",
    snoozTime: null,
    description: "No Expected Freight Found",
    type: "freight.unit.allocate.transporter.event",
    uuid: "3035225c-a75a-481b-986d-82bb99f213d9",
    status: "Confirm",
    updatedAt: null,
    },
    {
    closedBy: null,
    createdAt: 1686144628759,
    issueId: null,
    createdBy: "system",
    snoozTime: null,
    description: "No Expected Freight Found",
    type: "freight.unit.allocate.transporter.event",
    uuid: "f86f41de-27e0-4d35-a1ae-815c0f227a04",
    status: "Confirm",
    updatedAt: null,
    },
    {
    closedBy: null,
    createdAt: 1686144647899,
    issueId: null,
    createdBy: null,
    snoozTime: null,
    description:
    "Freight Changed from 1.0 / perVehicle to 100.0 / perVehicle.",
    type: "shipper.freight.changed.notification",
    uuid: "1325090b-eb57-4344-b8e7-c7acc9a0a663",
    status: "Confirmed",
    updatedAt: 1686144647899,
    },
    ],
    transporterId: "b32980e6-e6bd-489d-aa78-ef769308e522",
    purchaseOrderId: null,
    shipmentId: null,
    allocationHistory: null,
    status: "INDENT",
    trasporter: {
    geoFence: null,
    documents: [],
    customFields: [
    {
    fieldType: "text",
    fieldKey: "bidRemainingV2",
    value: "0",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["bidRemainingV2_0"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "bidSubmittedV2",
    value: "2",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["bidSubmittedV2_2"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "minRemainingTimeV2",
    value: "0",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["minRemainingTimeV2_0"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "totalAuctionsV2",
    value: "2",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["totalAuctionsV2_2"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "criticalOrderV2",
    value: "0",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["criticalOrderV2_0"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "live-auctions",
    value: "2",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["live-auctions_2"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "live-bids-pending",
    value: "0",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["live-bids-pending_0"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    {
    fieldType: "text",
    fieldKey: "totalPlacementPendingV2",
    value: "4",
    multiple: false,
    isRemark: false,
    remark: null,
    required: false,
    description: null,
    options: null,
    indexedValue: ["totalPlacementPendingV2_4"],
    valueType: "String",
    input: "String",
    unit: null,
    accessType: null,
    uuid: null,
    },
    ],
    isPortalEnabled: true,
    type: "vendor",
    updates: {
    forwardReasons: [
    "business.partner.update.event",
    "business.partner.custom.field",
    ],
    updatedBy: "SYSTEM",
    userId: null,
    time: 1686136173502,
    resourceType: "Business-Partner",
    resourceId: "b32980e6-e6bd-489d-aa78-ef769308e522",
    sourceOfInformation: null,
    updateType: null,
    description:
    "updated field bidRemainingV2|updated field bidSubmittedV2|updated field minRemainingTimeV2|updated field live-bids-pending",
    forwardedFrom: null,
    uuid: "4c811f27-38e2-4db1-a199-5f4a4f025b49",
    revision: null,
    traceID: "58b9e81c-059a-441e-8bf7-5241b12ab187",
    changes: [
    {
    currentValue: "0",
    fieldName: "bidRemainingV2",
    lastValue: "1",
    fieldType: "String",
    },
    {
    currentValue: "2",
    fieldName: "bidSubmittedV2",
    lastValue: "1",
    fieldType: "String",
    },
    {
    currentValue: "0",
    fieldName: "minRemainingTimeV2",
    lastValue: "1686146565000",
    fieldType: "String",
    },
    {
    currentValue: "0",
    fieldName: "live-bids-pending",
    lastValue: "1",
    fieldType: "String",
    },
    ],
    },
    uuid: "b32980e6-e6bd-489d-aa78-ef769308e522",
    orgId: "3e4cdee9-0b3b-46dd-9b98-df0e38a0271c",
    firmType: "INDIVISUAL",
    gstn: "07ADRPK6797N2ZC",
    voterId: null,
    verificationTicketId: null,
    group: {
    partnerType: "vendor",
    name: "Broker",
    uuid: "661a7cb5-339b-48f5-942f-967e9fc1abf3",
    orgId: "3e4cdee9-0b3b-46dd-9b98-df0e38a0271c",
    },
    address:
    '{"pincode":110035,"address":"23-B, GALI NO. 12, ANAND PARVAT IND","city":"NEW DELHI","state":""}',
    verificationStatus: "unverified",
    externalId: "7500036",
    panNumber: "ADRPK6797N",
    aadharNo: null,
    parentId: null,
    places: [],
    route: null,
    name: "GLOBE GOLDEN TRANSPORT.",
    location: null,
    fretronId: null,
    contacts: [
    {
    name: "GLOBE GOLDEN TRANSPORT.",
    mobileNumber: null,
    address: null,
    emails: ["admin@globegoldentransport.com"],
    mobileNumbers: ["9313308630"],
    type: null,
    },
    {
    name: "GLOBE GOLDEN TRANSPORT UDAIPUR",
    mobileNumber: null,
    address: null,
    emails: ["globe.uda@gmail.com"],
    mobileNumbers: ["7982263077"],
    type: null,
    },
    {
    name: "GLOBE GOLDEN TRANSPORT JAIPUR",
    mobileNumber: null,
    address: null,
    emails: ["globe.jprr@gmail.com"],
    mobileNumbers: ["9664337082"],
    type: null,
    },
    {
    name: "GLOBE GOLDEN TRANSPORT ROORKEE",
    mobileNumber: null,
    address: null,
    emails: ["rrk@globegoldentransport.com"],
    mobileNumbers: ["8899840217"],
    type: null,
    },
    ],
    status: "ACTIVE",
    },
    },
    ],
    documentDate: 1686144527834,
    totalQuantity: {
    volume: null,
    packageMeasurement: {
    grossQuantity: 694,
    netQuantity: 694,
    unitOfMeasurment: "Units",
    },
    weight: {
    grossQuantity: 2.788,
    netQuantity: 2.788,
    unitOfMeasurment: "Metric Tonnes",
    },
    containers: null,
    trucks: null,
    },
    auctionQuantity: null,
    customFields: [
    {
    indexedValue: ["Total Quantity_2.788"],
    fieldKey: "Total Quantity",
    multiple: false,
    description: "",
    remark: "",
    uuid: null,
    required: false,
    accessType: null,
    input: "string",
    unit: "",
    valueType: "string",
    fieldType: "text",
    value: "2.788",
    isRemark: false,
    },
    {
    indexedValue: ["Total Bucket_60"],
    fieldKey: "Total Bucket",
    multiple: false,
    description: "",
    remark: "",
    uuid: null,
    required: false,
    accessType: null,
    input: "string",
    unit: "",
    valueType: "string",
    fieldType: "text",
    value: "60",
    isRemark: false,
    },
    {
    indexedValue: ["Extra Bucket_0"],
    fieldKey: "Extra Bucket",
    multiple: false,
    description: "",
    remark: "",
    uuid: null,
    required: false,
    accessType: null,
    input: "string",
    unit: "",
    valueType: "string",
    fieldType: "text",
    value: "0",
    isRemark: false,
    },
    {
    indexedValue: ["FU Total Weight_2.788"],
    fieldKey: "FU Total Weight",
    multiple: false,
    description: "",
    remark: "",
    uuid: null,
    required: false,
    accessType: null,
    input: "string",
    unit: "",
    valueType: "string",
    fieldType: "text",
    value: "2.788",
    isRemark: false,
    },
    ],
    documentNumber: "FL0001785",
    allocatedQuantity: null,
    allowedLoadTypes: [
    {
    bodyType: "Covered",
    passingCapacityMT: 35,
    passingCapacityCFT: 50,
    partnerName: null,
    minLength: 0,
    includeMinLength: false,
    partnerExternalId: null,
    externalId: null,
    updates: {
    traceID: null,
    resourceId: "395d8ad5-9f1b-469a-b2bd-410f23c3dbf1",
    updatedBy: "USER",
    changes: null,
    sourceOfInformation: null,
    description: "Updated Load Type .",
    forwardReasons: ["load.type.updated.event"],
    userId: "7d6539ac-5dd0-48d4-80d7-251fbdb86158",
    uuid: "f758a920-2a08-4249-ba49-461accfd8874",
    revision: null,
    time: 1684825027899,
    forwardedFrom: null,
    resourceType: "LoadTypes",
    updateType: null,
    },
    vehicleCategories: null,
    uuid: "395d8ad5-9f1b-469a-b2bd-410f23c3dbf1",
    orgId: "3e4cdee9-0b3b-46dd-9b98-df0e38a0271c",
    vehicleCategory: "Trailer",
    includeMaxLength: false,
    minHeight: 0,
    numberOfWheels: 16,
    chassisType: "Container",
    includeMinHeight: false,
    maxHeight: -1,
    name: "Truck",
    partnerId: null,
    includeMaxHeight: false,
    dimensionString: null,
    maxLength: -1,
    },
    ],
    updates: {
    traceID: "40c3b92d-f23e-457a-8528-55da79e0447f",
    resourceId: "ce28d25c-02fd-494c-a3f1-6b2f20458b76",
    updatedBy: "USER",
    changes: null,
    sourceOfInformation: "USER",
    description:
    "Indent to transporter GLOBE GOLDEN TRANSPORT., vehicle type Truck.",
    forwardReasons: ["freight.unit.indent.to.transporter.event"],
    userId: "876fd698-08ba-4d2c-a095-fbe65c10b34b",
    uuid: "208e4015-7801-41d9-825d-78e36fe2e2a7",
    revision: 6,
    time: 1686144681728,
    forwardedFrom: "b32980e6-e6bd-489d-aa78-ef769308e522",
    resourceType: "FreightUnit",
    updateType: null,
    },
    type: "Planned",
    uuid: "ce28d25c-02fd-494c-a3f1-6b2f20458b76",
    orgId: "3e4cdee9-0b3b-46dd-9b98-df0e38a0271c",
    details: {
    totalItems: 1,
    totalValueOfGoods: 0,
    totalQuantity: {
    weight: {
    grossQuantity: 2.7876859938766074,
    netQuantity: 2.7876859938766074,
    unitOfMeasurment: "Metric Tonnes",
    },
    volume: {
    grossQuantity: 0,
    netQuantity: 0,
    unitOfMeasurment: "",
    },
    packageMeasurement: {
    grossQuantity: 694,
    netQuantity: 694,
    unitOfMeasurment: "Units",
    },
    },
    consignee: ["BALAJI SALES"],
    consignors: ["FENA (P) LIMITED (UDAIPUR)"],
    route: [],
    materials: ["3D DANGLER 6X11.5 HINDI NSB RT(A)"],
    orderNumber: ["FRSO0002041"],
    origins: ["UDAIPUR"],
    destinations: ["MARWAR JUNCTION"],
    },
    children: [
    {
    name: "MARWAR JUNCTION",
    uuid: "",
    filter: ["f1ccfcac-2619-4fa1-b393-dd0efb5e4300", "MARWAR JUNCTION"],
    details: {
    totalItems: 1,
    totalValueOfGoods: 0,
    totalQuantity: {
    weight: {
    grossQuantity: 2.7876859938766074,
    netQuantity: 2.7876859938766074,
    unitOfMeasurment: "Metric Tonnes",
    },
    volume: {
    grossQuantity: 0,
    netQuantity: 0,
    unitOfMeasurment: "",
    },
    packageMeasurement: {
    grossQuantity: 694,
    netQuantity: 694,
    unitOfMeasurment: "Units",
    },
    },
    consignee: ["BALAJI SALES"],
    consignors: ["FENA (P) LIMITED (UDAIPUR)"],
    route: [],
    materials: ["3D DANGLER 6X11.5 HINDI NSB RT(A)"],
    orderNumber: ["FRSO0002041"],
    origins: ["UDAIPUR"],
    destinations: ["MARWAR JUNCTION"],
    },
    },
    ],
   };

async function generateHtmlAndSendMail(orders, fu) {
    try {
        const html = generateHTML(orders, fu);
        const subject = "Warning: Exceeded Distance Limit of 120kms";
        const to = ["atul.bhatia@fretron.com"];
        const cc = [];

        const result = await sendMail(subject, to, cc, html);
        console.log(result);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}
async function sendMail(subject, to, cc, html) {
    try {
        await rp({
            uri: `${FRT_PUB_BASE_URL}/notifications/emails/email`,
            method: "POST",
            body: {
                cc: cc,
                to: to,
                subject: subject,
                html: html,
            },
            timeout: 2000,
            json: true,
        });
        return "Mail sent successfully!";
    } catch (error) {
        console.log(`Caught error in sending mail - ${error.message}`);
    }
    return null;
}

function generateHTML(orders, fu) {
    let order = orders.length ? orders[0] : null
    var html = `
      <html>
        <head>
          <title>Order Alert</title>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
  
            th,
            td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
  
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <div>
            <p>Dear User,</p>
            <p>We would like to alert you about an issue with your recent orders. The distance between the destinations of the two orders you have combined exceeds 120 kilometers.</p>
            
            <p>To ensure efficient and timely delivery, we advise you to refrain from combining orders with such a significant distance difference. This can lead to complications, including delays and higher shipping costs.</p>
            
            <p>Please review the details below:</p>
            
            <table>
              <tr>
                <th>Dispatch No</th>
                <th>Order Numbers</th>
                <th>Total Weight</th>
                <th>Dispatch Plant</th>
                <th>Customer</th>
                <th>Destinations</th>
              </tr>
              <tbody>`;
              let dispatchNumber = fu.documentNumber;
              let orderNumber = order?.orderNumber ?? '';
              let dispatchPlant = order?.salesOffice?.name ??order?.consignmentBranch?.name  ?? '';
              let customer = order?.customer?.name ?? '';
              let destinations = order?.customer?.places?.[0]?.name ?? "";
              let weight = 0;
              let volume = 0;
              let packageMeasurement = 0;
              
              let totalWeight = order?.mappings?.[0]?.quantity;
              if (totalWeight) {
                if (totalWeight.weight) {
                  weight = totalWeight.weight.netQuantity || 0;
                }
              
                if (totalWeight.volume) {
                  volume = totalWeight.volume.netQuantity || 0;
                }
              
                if (totalWeight.packageMeasurement) {
                  packageMeasurement = totalWeight.packageMeasurement.netQuantity || 0;
                }
              }
              
              let netWeight = weight + volume + packageMeasurement;
              
              html+= `
               <tr>
               <td>${dispatchNumber}</td>
               <td>${orderNumber}</td>
               <td>${netWeight}</td>
               <td>${dispatchPlant}</td>
               <td>${customer}</td>
               <td>${destinations}</td>
               </tr>`;
              

    html += `
        </tbody>
      </table>
      
      <p>For a seamless experience, we recommend placing separate orders for each destination.</p>
      
      <p>If you have any questions or need assistance, feel free to contact our customer support team.</p>
      
      <p>Thank you for your cooperation.</p>
      
      <p>Best regards,</p>
      <p>Fretron Private Limited</p>
    </div>
  </body>
  </html>`;

    return html;
}

async function main() {
    try {
        let fu = $event;
        console.log(`Document Number - ${fu.documentNumber}`)
        const payload = {
            actionData: fu
        }
        let res = await checkRouteOptimization(payload)
        if  (true) {
            console.log(`Incoming response is 400 triggering mail: ${res.status}`);
            const lineItemId = fu.lineItems[0].uuid;
            const orders = await ordersGetFromFu(lineItemId, token)

            await generateHtmlAndSendMail(orders, fu)
        } else {
            console.log(`Response is success not sending mail`)
        }
        console.log(res.status);
    } catch (error) {
        console.log(`Some error ${error.message}`)

        return null
    }


}

async function checkRouteOptimization(payload) {
    const url = `${FRT_PUB_BASE_URL}/automate/autoapi/run/4f99b041-5fbc-485a-b259-01f629b10128`;
    try {
        const res = await rp({
            method: "POST",
            uri: url,
            body: payload,
            json: true,
        });
        console.log(`Incoming Res status - ${res?.status ?? ""}`);
        return res
    }
    catch {
        console.log(`Some error ${error.message}`)

        return null
    }
}

async function ordersGetFromFu(fuLineItemId, token) {
    const url = `${FRT_PUB_BASE_URL}/shipment-view/sales/v2/orders_new?byLineItems=true&orderOrEnquiry=order&limit=500&filters=${JSON.stringify(
        {
        _nested: {
        _path: "lineItems",
        _include_nested_hits: true,
        "lineItems.freightUnitLineItemIds": [fuLineItemId],
        },
        }

    )}`
    try {
        const options = {
            uri: url,
            method: "GET",
            json: true,
            headers: {
                Authorization: token,
            },

        };
        const orders = await rp(options);
        console.log(`Total Orders - ${orders.length}`);

        return orders;
    }
    catch (error) {
        console.log(`Some error ${error.message}`)

        return []
    }
}

main()
