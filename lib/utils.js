const {
  BatchWriteItemCommand,
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb')

module.exports = {
  getPage: async (browser, url) => {
    try {
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle0' })
      return await page.evaluate(() => document.body.innerHTML)
    } catch (error) {
      console.error(error)
      return ''
    }
  },
  sendBatchWriteRequest: async (request) => {
    try {
      const client = new DynamoDBClient({ region: process.env.AWS_REGION })
      await client.send(new BatchWriteItemCommand(request))
    } catch (error) {
      console.error(error)
    }
  },
}
