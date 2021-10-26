'use strict'
const chromium = require('chrome-aws-lambda')
const { getPage, sendBatchWriteRequest } = require('./lib/utils')
const TimeslotGateway = require('./lib/gateways/timeslot-gateway')
const DynamoGateway = require('./lib/gateways/dynamo-gateway')
const GetTimeslots = require('./lib/use-cases/get-timeslots')
const WriteTimeslots = require('./lib/use-cases/write-timeslots')

module.exports.check = async (_event) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const timeslotGateway = TimeslotGateway({ browser, getPage })
  const dynamoGateway = DynamoGateway({ sendBatchWriteRequest })
  const get = GetTimeslots({ timeslotGateway })
  const write = WriteTimeslots({ dynamoGateway })

  const timeslots = await get.execute({ days: process.env.NUM_DAYS })
  await write.execute({ timeslots })

  browser.close()

  console.log('Available timeslots: %O', JSON.stringify(timeslots))
}
