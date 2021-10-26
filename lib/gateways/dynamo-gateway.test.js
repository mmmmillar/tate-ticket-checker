process.env.DYNAMO_TABLE_NAME = 'MY_TABLE'
process.env.EVENT_ID = 99

const { marshall } = require('@aws-sdk/util-dynamodb')
const DynamoGateway = require('./dynamo-gateway')

describe('dynamo-gateway', () => {
  describe('writeTimeslots', () => {
    test('write the available timeslots', async () => {
      const sendBatchWriteRequest = jest.fn()
      const gateway = DynamoGateway({ sendBatchWriteRequest })

      await gateway.writeTimeslots([
        {
          date: '20500101',
          timeslots: [{ time: '3:30pm' }],
          url: 'https://tickets?id=99-20500101',
        },
        {
          date: '20500102',
          timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
          url: 'https://tickets?id=99-20500102',
        },
      ])

      expect(sendBatchWriteRequest).toHaveBeenCalledWith({
        RequestItems: {
          MY_TABLE: [
            {
              PutRequest: {
                Item: expect.objectContaining({
                  pk: { S: `#EVENT#99` },
                  sk: { S: `#DATE#20500101` },
                  timeslots: { L: [{ M: marshall({ time: '3:30pm' }) }] },
                }),
              },
            },
            {
              PutRequest: {
                Item: expect.objectContaining({
                  pk: { S: `#EVENT#99` },
                  sk: { S: `#DATE#20500102` },
                  timeslots: {
                    L: [
                      { M: marshall({ time: '3:15pm' }) },
                      { M: marshall({ time: '3:30pm' }) },
                    ],
                  },
                }),
              },
            },
          ],
        },
      })
    })

    test('sets the ttl to the day after the event', async () => {
      const sendBatchWriteRequest = jest.fn()
      const gateway = DynamoGateway({ sendBatchWriteRequest })

      await gateway.writeTimeslots([
        {
          date: '19700101',
          timeslots: [{ time: '3:30pm' }],
          url: 'https://tickets?id=99-19700101',
        },
      ])

      expect(sendBatchWriteRequest).toHaveBeenCalledWith({
        RequestItems: {
          MY_TABLE: [
            {
              PutRequest: {
                Item: expect.objectContaining({
                  ttl: { N: `${new Date(1970, 0, 2).getTime() / 1000}` },
                }),
              },
            },
          ],
        },
      })
    })
  })
})
