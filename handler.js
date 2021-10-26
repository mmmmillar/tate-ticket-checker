'use strict'
const chromium = require('chrome-aws-lambda')
const { getPage } = require('./lib/utils')
const TimeslotGateway = require('./lib/gateways/timeslot-gateway')
const GetTimeslots = require('./lib/use-cases/get-timeslots')

module.exports.check = async (_event) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const timeslotGateway = TimeslotGateway({ browser, getPage })
  const usecase = GetTimeslots({ timeslotGateway })
  const result = await usecase.execute({ days: process.env.NUM_DAYS })

  browser.close()

  console.log(JSON.stringify(result))
  return result
}
