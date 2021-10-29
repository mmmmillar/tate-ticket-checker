process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'
process.env.EVENT_ID = 99

const GetTimeslots = require('./lib/use-cases/get-timeslots')
const WriteTimeslots = require('./lib/use-cases/write-timeslots')
const SendEmail = require('./lib/use-cases/send-email')
const TimeslotGateway = require('./lib/gateways/timeslot-gateway')
const DynamoGateway = require('./lib/gateways/dynamo-gateway')
const SesGateway = require('./lib/gateways/ses-gateway')
const { pages } = require('./lib/test-data')

describe('acceptance-tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(2050, 0, 1))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const createTimeslotGateway = (pages) => {
    const getPage = jest.fn()

    for (const page of pages) {
      getPage.mockReturnValueOnce(page)
    }

    return TimeslotGateway({ browser: {}, getPage })
  }

  test('get the available timeslots for today', async () => {
    const timeslotGateway = createTimeslotGateway([pages.timeslots_1])
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 1 })

    expect(result).toEqual([
      {
        date: '20500101',
        timeslots: [{ time: '3:30pm' }],
        url: 'https://tickets?id=99-20500101',
      },
    ])
  })

  test('get the available timeslots for today and tomorrow', async () => {
    const timeslotGateway = createTimeslotGateway([
      pages.timeslots_1,
      pages.timeslots_2,
    ])
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 2 })

    expect(result).toEqual([
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
  })

  test('writing the available timeslots to the db produces no errors', async () => {
    const sendBatchWriteRequest = jest.fn()
    const dynamoGateway = DynamoGateway({ sendBatchWriteRequest })
    const usecase = WriteTimeslots({ dynamoGateway })

    const write = usecase.execute({
      timeslots: [
        {
          date: '20500101',
          timeslots: [{ time: '3:30pm' }],
          url: 'https://tickets?id=99-20500101',
        },
      ],
    })

    await expect(write).resolves.toBeUndefined()
  })

  test('send email when tickets have become available', async () => {
    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    const send = usecase.execute({
      update: {
        new: {
          date: '20500101',
          timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
          url: 'https://tickets?id=99-20500101',
        },
      },
    })

    expect(sesGateway.send).toHaveBeenCalled()
    await expect(send).resolves.toBeUndefined()
  })

  test('do not send email if tickets were already available', async () => {
    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    await usecase.execute({
      update: {
        old: {
          date: '20500101',
          timeslots: [{ time: '3:15pm' }],
          url: 'https://tickets?id=99-20500101',
        },
        new: {
          date: '20500101',
          timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
          url: 'https://tickets?id=99-20500101',
        },
      },
    })

    expect(sesGateway.send).not.toHaveBeenCalled()
  })
})
