const rp = require("request-promise");
const _ = require('lodash')
const TOKEN =
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2ODY1ODE5ODYsInVzZXJJZCI6ImE0MmU1MzljLTg4ZjMtNDJjZi1hMWU3LWQxM2UwYjYwODMzZCIsImVtYWlsIjoic3lzdGVtX2ludGVncmF0aW9uQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTAwMDAwMDAwMCIsIm9yZ0lkIjoiZDI1NWEwMDAtZjI3MS00ODllLTk0MDgtYjlmYjdkNTkyYjQ0IiwibmFtZSI6IlN5c3RlbSBJbnRlZ3JhdGlvbiIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjp0cnVlLCJwb3J0YWxUeXBlIjoiYmFzaWMifQ.5mAHmluWOEbEV2sFL62cj3lcS5fHS1n8xaESk9-DPeo"
var FRT_PUB_BASE_URL = "https://apis.fretron.com";
const allowedConsigneeExtId = ["1090000212", "1090000251", "1090000252", "1090000178", "1090000253", "1090000113", "1090000118", "1030000208", "1090000116", "1030000168", "1030000020", "1030000010", "1030000073", "1030000328", "1030000158", "1030000320", "1030000299", "1030000162", "1030000016", "1030000248", "1030000080", "1030000014", "1030000015", "1030000077", "1030000012", "1030000168", "1030000320", "1030000016", "1030000248", "1030000080", "1030000014", "1030000015", "1030000077", "1090000178", "1090000231", "1090000112"];
async function main() {
    try {
        let shipments = await getShipments(TOKEN)

        await generateHtmlAndSendMail(shipments)
    }
    catch (error) {

        console.log(`Some error${error}`);
    }
}

async function getShipments(token) {
    try {
        const today = new Date(Date.now());
        const twentyFourHrDiff = 24 * 60 * 60 * 1000;
        const yesterday = new Date(Date.now() - twentyFourHrDiff);

        let url = `${FRT_PUB_BASE_URL}/shipment-view/shipments/v1?filters=${JSON.stringify(
            {
                shipmentDate: {
                    isTillExpression: false,
                    isFromExpression: false,
                    from: new Date(
                        yesterday.getFullYear(),
                        yesterday.getMonth(),
                        yesterday.getDate(),
                        0,
                        0,
                        0,
                        0
                    ).valueOf(),
                    till: new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                        0,
                        0,
                        0,
                        0
                    ).valueOf(),
                },
                __version: 2,
            }
        )}&size=500&allFields=["consignments", "shipmentNumber", "uuid", "shipmentDate"]`;
        console.log(url);
        let options = {
            uri: url,
            json: true,
            method: "GET",
            headers: {
                Authorization: token,
            },
        };

        const res = await rp(options);
        console.log(`Total shipments fetched - ${res.length}`);
        return res;
    } catch (error) {
        console.log(`Catched error in getting shipments - ${error.message}`);
    }
    return [];
}

async function generateHtmlAndSendMail(shipments) {
    try {
        const html = mainHtml(shipments);

        if (!html) {
            console.log(`-----Some error generating html -----`);
            return;
        }
        const subject = "EPOD Updates";
        const to = ["atul.bhatia@fretron.com"];
        const cc = [""];

        const result = await sendMail(subject, to, cc, html);
        console.log(result);
    } catch (error) {
        console.log(`Error in generating html and sending mail: ${error.message}`);
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

function generateTable1(shipments) {
    try {
        let shipmentDates = new Date(shipments[0].shipmentDate).toLocaleDateString(`en-gb`);

        let cnsDetails = []

        shipments.forEach(shipment =>
            cnsDetails = cnsDetails.concat(shipment.consignments?.filter(_ => allowedConsigneeExtId.includes(_.consignee.externalId))?.map(e => {
                return {
                    consignment: e,
                    shipmentNumber: shipment.shipmentNumber
                }
            }) ?? [])
        );

        console.log(`Total Consignments- ${cnsDetails.length}`);
        console.log(`Total Consignments details - ${JSON.stringify(cnsDetails)}`);

        let epodToBeTriggered = 0;
        let epodSubmittedByUser = 0;
        let vehicleReported = cnsDetails.length

        console.log(`Total Vehicles reported- ${vehicleReported}`);

        cnsDetails.forEach(cnsDetail => {
            const cf = cnsDetail.consignment.customFields
            let smsSentField = getFromCf(cf, "SMS Sent");
            let emailSentField = getFromCf(cf, "Email Sent");

            //for epodToBeTriggered case
            if (smsSentField !== "Yes" && emailSentField !== "Yes") {
                epodToBeTriggered++;
            }

            // for epodSubmittedByUser case
            if (cnsDetail.consignment.pod?.status === 'SUBMITTED') {
                epodSubmittedByUser++;
            } ``
        });
        console.log(`EPOD To Be Triggered :${epodToBeTriggered}`);

        console.log(`Epod Submitted By User: ${epodSubmittedByUser}`);


        let totalLinkToBeSent = cnsDetails.length
        console.log(`Total link to be sent: ${totalLinkToBeSent}`);


        var html1 = `
                      <table>
                        <tr>
                          <th>Date</th>
                          <th>Vehicles Reported</th>
                          <th>EPOD Links to be triggered</th>
                          <th>EPOD Submitted By User</th>
                        </tr>
                        <tbody>`;


        html1 += `
                         <tr>
                         <td>${shipmentDates}</td>
                         <td>${vehicleReported}</td>
                         <td>${epodToBeTriggered}</td>
                         <td>${epodSubmittedByUser}</td>
                         </tr>`;


        html1 += `
                  </tbody>
                </table>`;

        return html1




    } catch (error) {
        console.log(`Catched error in generateTable1 - ${error.message}`);
    }

    return ""
}


function generateTable2(shipments) {
    try {
        let shDate = new Date(shipments[0].shipmentDate);
        const options = {
            day: 'numeric',
            month: 'long'
        };
        const formattedDate = shDate.toLocaleDateString('en-US', options);

        let final = new Array();
        shipments.forEach((element) => {
            final = final.concat(
                element.consignments?.filter(_ => allowedConsigneeExtId.includes(_.consignee.externalId))?.map((e) => {
                    let obj = {};

                    obj["shipmentNumber"] = element.shipmentNumber;
                    let cfs = e.customFields;

                    let smsSent = getFromCf(cfs, "SMS Sent");
                    let emailSent = getFromCf(cfs, "Email Sent");

                    let epodToBeTriggered =
                        smsSent !== "Yes" && emailSent !== "Yes";

                    let epodSubmitted = e.pod?.status === "SUBMITTED" ? 1 : 0;

                    obj["customerName"] = String(e.consignee.name).toUpperCase();
                    obj["placeName"] = e.consignee.places?.[0]?.name ?? ""
                    obj["externalId"] = e.consignee.externalId
                    obj["epodToBeTriggered"] = epodToBeTriggered ? 1 : 0;
                    obj["epodSubmitted"] = epodSubmitted ? 1 : 0;

                    return obj;
                }) ?? []
            );
        });

        console.log(`Total Cns - ${final.length}`);

        let groupedData = _.groupBy(final, "externalId");

        let html2 = `
      <div style="display: flex; justify-content:center;">
        <table>
          <tr>
            <th colspan="5" style="text-align: center; font-size: 20px;">
              Customer Wise Details ${formattedDate}
            </th>
          </tr>
          <tr>
            <th>Customer Name</th>
            <th>Vehicles Reported</th>
            <th>EPOD Links to be triggered</th>
            <th>EPOD Submitted By User</th>
          </tr>
          <tbody>`;

        for (let externalId in groupedData) {
            let arr = groupedData[externalId];

            // let customerName = String(arr[0].customerName).toUpperCase()
            let placeName = arr[0].placeName

            let vehicleReported = arr.length

            let epodToBeTriggered = arr.reduce(
                (total, consignment) => total + consignment.epodToBeTriggered,
                0
            );
            let epodSubmitted = arr.reduce(
                (total, consignment) => total + consignment.epodSubmitted,
                0
            );

            html2 += `
          <tr>
            <td>${placeName}</td>
            <td>${vehicleReported}</td>
            <td>${epodToBeTriggered}</td>
            <td>${epodSubmitted}</td>
          </tr>`;
        }

        html2 += `
          </tbody>
        </table>
      </div>`;

        return html2;
    } catch (error) {
        console.log(`Caught error in generateTable2 - ${error.message}`);
    }
    return "";
}


function mainHtml(shipments) {
    let table1 = generateTable1(shipments);
    let table2 = generateTable2(shipments);

    let mainContent = `
    <html>

    <head>
        <title>Order Alert</title>
        <style>
            .table-container {
                display: flex;
                justify-content: center;
            }
    
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
        ${table1}
        <br />
        <br />
        <br />
        <br />
        <br />
        ${table2}
    
    </body>

</html>`

    return mainContent
}
function getFromCf(cf, fieldKey) {
    return cf?.find((_) => _.fieldKey === fieldKey)?.value ?? "";
}

main()