const _ = require('lodash')
const arr = [
    {
        shipmentNumber: 'FRETSH000023530',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023522',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023520',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023520',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023519',
        customerName: 'JINDAL STAINLESS STEELWAY LTD. - MANJUSAR, TALUKA - SAVALI, VADODARA',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023518',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023518',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023517',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023517',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023513',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 0,
        epodSubmitted: 1
    },
    {
        shipmentNumber: 'FRETSH000023513',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 0,
        epodSubmitted: 1
    },
    {
        shipmentNumber: 'FRETSH000023512',
        customerName: 'JINDAL STAINLESS  LIMITED',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023512',
        customerName: 'JINDAL STAINLESS  LIMITED',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023511',
        customerName: 'JINDAL STAINLESS STEELWAY LTD. - DIST. Raigad (MAHARASHTRA)',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023511',
        customerName: 'JINDAL STAINLESS STEELWAY LTD. - DIST. RAIGARH (MAHARASHTRA)',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023510',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023510',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023509',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023509',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023506',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023506',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023506',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023501',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 0,
        epodSubmitted: 1
    },
    {
        shipmentNumber: 'FRETSH000023496',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023496',
        customerName: 'JINDAL STAINLESS STEELWAY LIMITED - gurgaon',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023495',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023495',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023495',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023495',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023495',
        customerName: 'Jindal Stainless Limited',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    },
    {
        shipmentNumber: 'FRETSH000023493',
        customerName: 'JINDAL STAINLESS STEELWAY LTD - Thiruvallur,Chennai ',
        epodToBeTriggered: 1,
        epodSubmitted: 0
    }
]

console.log(_.groupBy(arr, "customerName"));