process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'
process.env.EVENT_ID = 99

const GetTimeslots = require('./get-timeslots')
const TimeslotGateway = require('../gateways/timeslot-gateway')
const { pages } = require('../test-data')

describe('get-timeslots', () => {
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
    jest.spyOn(timeslotGateway, 'getTimeslotsForDate')
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 1 })

    expect(timeslotGateway.getTimeslotsForDate).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('20500101')
    expect(result[0].timeslots).toEqual([{ time: '3:30pm' }])
    expect(result[0].url).toEqual('https://tickets?id=99-20500101')
  })

  test('get the available timeslots for today and tomorrow', async () => {
    const timeslotGateway = createTimeslotGateway([
      pages.timeslots_1,
      pages.timeslots_2,
    ])
    jest.spyOn(timeslotGateway, 'getTimeslotsForDate')
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 2 })

    expect(timeslotGateway.getTimeslotsForDate).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('20500101')
    expect(result[0].timeslots).toEqual([{ time: '3:30pm' }])
    expect(result[1].date).toBe('20500102')
    expect(result[1].timeslots).toEqual([
      { time: '3:15pm' },
      { time: '3:30pm' },
    ])
  })

  test('extracts the time from the slot text', async () => {
    const timeslotGateway = createTimeslotGateway([pages.timeslots_3])
    jest.spyOn(timeslotGateway, 'getTimeslotsForDate')
    const usecase = GetTimeslots({ timeslotGateway })

    const result = await usecase.execute({ days: 1 })

    expect(result[0].timeslots).toEqual([
      { time: '11:00am' },
      { time: '4:00pm' },
    ])
  })
})
