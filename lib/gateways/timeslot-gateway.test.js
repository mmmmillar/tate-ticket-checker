process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'
process.env.EVENT_ID = 99

const TimeslotGateway = require('./timeslot-gateway')
const { pages } = require('../test-data')

describe('timeslot-gateway', () => {
  describe('getTimeslotsForDate', () => {
    test('get the available timeslots for date', async () => {
      const expectedBrowser = {}
      const expectedUrl = 'https://tickets?id=99-20500101'
      const getPage = jest.fn(() => pages.timeslots_1)
      const gateway = TimeslotGateway({
        browser: {},
        getPage,
      })

      const result = await gateway.getTimeslotsForDate('20500101')

      expect(getPage).toHaveBeenCalledWith(expectedBrowser, expectedUrl)
      expect(result).toStrictEqual({
        date: '20500101',
        timeslots: [{ time: '3:30pm' }],
        url: expectedUrl,
      })
    })

    test('get zero timeslots for date when no timeslots', async () => {
      const gateway = TimeslotGateway({
        browser: {},
        getPage: jest.fn(() => pages.no_timeslots),
      })

      const result = await gateway.getTimeslotsForDate('20500101')

      expect(result).toStrictEqual({
        date: '20500101',
        timeslots: [],
        url: expect.any(String),
      })
    })

    test('get zero timeslots when page is empty', async () => {
      const gateway = TimeslotGateway({
        browser: {},
        getPage: jest.fn(() => pages.empty),
      })

      const result = await gateway.getTimeslotsForDate('20500101')

      expect(result).toStrictEqual({
        date: '20500101',
        timeslots: [],
        url: expect.any(String),
      })
    })

    test('extracts the time from the timeslot text', async () => {
      const gateway = TimeslotGateway({
        browser: {},
        getPage: jest.fn(() => pages.timeslots_3),
      })

      const result = await gateway.getTimeslotsForDate('20500101')

      expect(result.timeslots).toEqual([
        { time: '11:00am' },
        { time: '4:00pm' },
      ])
    })
  })
})
