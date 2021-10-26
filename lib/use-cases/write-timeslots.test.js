const WriteTimeslots = require('./write-timeslots')
const DynamoGateway = require('../gateways/dynamo-gateway')

describe('write-timeslots', () => {
  test('write the available timeslots', async () => {
    const timeslots = [
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
    ]

    const sendBatchWriteRequest = jest.fn()
    const dynamoGateway = DynamoGateway({ sendBatchWriteRequest })
    jest.spyOn(dynamoGateway, 'writeTimeslots')
    const usecase = WriteTimeslots({ dynamoGateway })

    await usecase.execute({ timeslots })

    expect(dynamoGateway.writeTimeslots).toHaveBeenCalledWith(timeslots)
  })
})
