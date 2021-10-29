const { unmarshall } = require('@aws-sdk/util-dynamodb')
const {
  BatchWriteItemCommand,
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb')
const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses')

module.exports = {
  dynamoImageToUpdateRecord: (image) => {
    if (!image) return
    const record = unmarshall(image)
    return {
      date: record.sk.replace('#DATE#', ''),
      eventId: record.pk.replace('#EVENT#', ''),
      timeslots: record.timeslots,
    }
  },
  getPage: async (browser, url) => {
    try {
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle0' })
      return await page.evaluate(() => document.body.innerHTML)
    } catch (error) {
      console.error('Error getting page. Url: %s, Error: %O', url, error)
      return ''
    }
  },
  sendBatchWriteRequest: async (request) => {
    try {
      const client = new DynamoDBClient({ region: process.env.AWS_REGION })
      await client.send(new BatchWriteItemCommand(request))
    } catch (error) {
      console.error(
        'Error writing to db. Request: %O, Error: %O',
        request,
        error
      )
    }
  },
  sendEmail: async (request) => {
    try {
      const client = new SESClient({ region: process.env.AWS_REGION })
      await client.send(new SendEmailCommand(request))
    } catch (error) {
      console.error(
        'Error sending email. Request: %O, Error: %O',
        request,
        error
      )
    }
  },
}
