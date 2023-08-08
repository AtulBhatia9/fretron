const rp = require("request-promise");
const TOKEN =
  "Beaer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2ODYyMjQxMTEsInVzZXJJZCI6ImViZTU3NTFhLWEwNWItNDZiNi05MWI0LTFjMTEyYTkwZjYzOCIsImVtYWlsIjoic3V5YXNoLmt1bWFyQGZyZXRyb24uY29tIiwibW9iaWxlTnVtYmVyIjoiOTU1NTEwNzcwMCIsIm9yZ0lkIjoiMDZhY2FjN2YtNTY5Ny00ZmVmLTlhNjEtZWVmNDdmNzUzNjdhIiwibmFtZSI6IlN1eWFzaCAiLCJvcmdUeXBlIjoiRkxFRVRfT1dORVIiLCJpc0dvZCI6dHJ1ZSwicG9ydGFsVHlwZSI6ImJhc2ljIn0.ndcyi-FgFIpP7hSfggBhZwlIwbSXGusRxW7CI80Yd7M";

var FRT_PUB_BASE_URL = "https://apis.fretron.com";
var bulkSync_Payload = {
  shipmentId: "",
  updates: [
    {
      keyToUpdate: "customfields",
      updatedValue: [
        {
          fieldKey: "Consent Status",
          valueType: "string",
          fieldType: "text",
          value: "ALLOWED",
        },
      ],
    },
  ],
};

async function main() {
  try {
    let shipments = await getShipment();

    for (const shipment of shipments) {
      try {
        let mobileNumber = shipment.fleetInfo.device.imei;
        let uuid = shipment.uuid;
        const consentData = await consentDetailsGET(mobileNumber, uuid);

        if (consentData?.consentStatus === "ALLOWED") {
          console.log(
            `Incoming consent status for number - ${mobileNumber} is ALLOWED------ proceeding to send data to SSIL`
          );
          //Payload value yet to be given from SSIL
          await sendDataToSSIl();

          bulkSync_Payload.shipmentId = uuid;
          await bulkSyncApi(bulkSync_Payload);
        }
      } catch (error) {
        console.log(`Error in processing shipment - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Error in main function - ${error.message}`);
  }
}

async function getShipment() {
  try {
    let res = await rp({
      uri: `${FRT_PUB_BASE_URL}/shipment-view/shipments/v1?filters=${JSON.stringify(
        {
          _shipmentTrackingStatus_: {
            _or: {
              _enroute_for_delivery_: {
                shipmentTrackingStatus: ["Enroute For Delivery"],
              },
            },
          },
          "_shcf_Consent Status": ["PENDING"],
          __version: 2,
        }
      )}&size=1000&allFields=["uuid","shipmentNumber", "customFields"]`,
      method: "GET",
      headers: {
        Authorization: TOKEN,
      },
      json: true,
    });

    console.log(
      `Total shipments having consent status pending - ${res.length}`
    );

    return res;
  } catch (error) {
    console.log(`Error in getShipment: ${error.message}`);
  }

  return [];
}

async function consentDetailsGET(mobilenumber, uuid) {
  let url = `${FRT_PUB_BASE_URL}/lbs-manager/v1/lbs-consent/consent?mobilenumber=${mobilenumber}&shipmentId=${uuid}`;
  try {
    let res = await rp({
      method: "GET",
      uri: url,
      headers: {
        Authorization: TOKEN,
      },
      json: true,
    });

    console.log(`Incoming response status - ${res.status}`);

    if (res.status === 200) {
      return res.data;
    } else {
      console.log(`Incoming error in response - ${res.error}`);
    }
  } catch (error) {
    console.log(`some error ${error.message}`);
  }

  return null;
}

async function bulkSyncApi(payload) {
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
      return res.data;
    } else {
      console.log(`Bulk Sync api response error: ${res.error}`);
      throw new Error(res.error);
    }
  } catch (e) {
    console.log(`Caught Error in Bulk Sync api: ${e.message}`);
    throw e;
  }
}

async function sendDataToSSIl(payload) {
  const url = "";
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

    console.log(`Response from sendDataToSSIl: ${res.status}`);
  } catch (error) {
    console.log(`Caught error in sending data to SSIL - ${error.message}`);
  }

  return null;
}
main()