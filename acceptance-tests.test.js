process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'
process.env.EVENT_ID = 99

const GetTimeslots = require('./lib/use-cases/get-timeslots')
const TimeslotGateway = require('./lib/gateways/timeslot-gateway')
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

  test('get zero timeslots for today when none available', async () => {
    const timeslotGateway = createTimeslotGateway([pages.no_timeslots])
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 1 })

    expect(result).toEqual([])
  })

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
})
