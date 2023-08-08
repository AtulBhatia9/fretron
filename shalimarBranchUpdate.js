const rp = require("request-promise");
const FRT_PUB_BASE_URL = "http://apis.fretron.com"

 const TOKEN = ""
async function getShipmentByFilter() {
  const currentDate = new Date();
  const fromDate = new Date(currentDate.getFullYear(), 5, 1);
  const tillDate = new Date(currentDate.getFullYear(), 5, 25);
  fromDate.setHours(0, 0, 0, 0);
  tillDate.setHours(23, 59, 59, 999);
  const from = fromDate.getTime();
  const till = tillDate.getTime();
  const filter = {
    shipmentDate: {
      isTillExpression: false,
      isFromExpression: false,
      from: from,
      till: till,
    },
    __version: 2,
  };
  const filterString = encodeURIComponent(JSON.stringify(filter));
  const url = `${FRT_PUB_BASE_URL}/shipment-view/shipments/v1?filters=${filterString}&size=400`;
  try {
    const options = {
      uri: url,
      method: "GET",
      json: true,
      headers: {
        Authorization: TOKEN,
      },
    };
    return await rp(options);
  } catch (error) {
    console.log(`Caught error in getting shipments - ${error.message}`);
  }
  return [];
}

async function getFuByItemId(freightUnitLineItemId) {
  let url = `${FRT_PUB_BASE_URL}/order-manager-v2/freight-units/v1/freight-units/by/linItemIds`;
  try {
    let res = await rp({
      method: "POST",
      uri: url,
      body: [freightUnitLineItemId],
      json: true,
      headers: {
        Authorization: TOKEN,
      },
    });
    if (res.status === 200) {
      return res.data;
    } else {
      console.log(`Get Freight Unit by item id ${freightUnitLineItemId} error: ${res.error}`);
    }
  } catch (e) {
    console.log(`Get Freight Unit by id ${freightUnitLineItemId} caught error: ${e.message}`);
  }
  return null;
}

async function getOrderById(orderId) {
  let url = `${FRT_PUB_BASE_URL}/order-manager-v2/sales-orders/v1/order/${orderId}`;
  try {
    let res = await rp({
      method: "GET",
      uri: url,
      json: true,
      headers: {
        Authorization: TOKEN,
      },
    });
    if (res.status === 200) {
      return res.data;
    } else {
      console.log(`Get Order by id ${orderId} error: ${res.error}`);
    }
  } catch (e) {
    console.log(`Get Order by id ${orderId} caught error: ${e.message}`);
  }
  return null;
}

async function bulkSyncApi(payload) {
  const url = `${FRT_PUB_BASE_URL}/shipment/v1/shipment/bulk/sync`;
  console.log("Payload:", payload);
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
    console.log(`Bulk Sync API response status: ${res.status}`);
    if (res.status == 200) {
      return res.data;
    } else {
      console.log(`Bulk Sync API response error: ${res.error}`);
    }
  } catch (e) {
    console.log(`Caught Error in Bulk Sync API: ${e.message}`);
  }
}

async function main() {
  try {
    let shipments = await getShipmentByFilter();
    console.log(`Total Shipments: ${shipments.length}`);
    shipments = shipments.filter( sh => sh.branch == null)
    console.log(`Total Shipments with branch not present: ${shipments.length}`);
    for (const shipment of shipments) {
      let shId = shipment.uuid;
      try {
        console.log(`Shipment ID : ${shId}`);
        if(shipment.branch){
          continue;
        }
        const freightUnitLineItemId = shipment.freightUnitLineItemId;
        console.log(`freightUnitLineItemId: ${freightUnitLineItemId}`);
        const freightUnit = await getFuByItemId(freightUnitLineItemId);
        if (freightUnit && freightUnit.length > 0) {
          const orderId = freightUnit[0].lineItems[0]?.salesOrderMappings[0]?.orderId ?? null;
          if (orderId) {
            console.log("Order ID:", orderId);
            const order = await getOrderById(orderId);
            if (order) {
              const branch = order.consignmentBranch ?? order.salesOffice;
              if (branch) {
                const payload = {
                  shipmentId: shId,
                  updates: [
                    {
                      keyToUpdate: "shbranch",
                      updatedValue: branch,
                    },
                  ],
                };
                await bulkSyncApi(payload);
              } else {
                console.log(`Branch not found on order: ${order.externalId}`);
              }
            } else {
              console.log(`Order not found for orderId: ${orderId} and shId: ${shId}`);
            }
          } else {
            console.log(`Order Id not found on Fu item : ${freightUnitLineItemId}`);
          }
        } else {
          console.log(`Freight Unit not found for shId: ${shId}`);
        }
      } catch (e) {
        console.log(`Catched error in updating branch for sh ${shId} : ${e.message}`)
      }
    }
  } catch (e) {
    console.log(`Error in main: ${e.message}`);
  }
}

main();
