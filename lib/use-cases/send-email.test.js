process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'

const SendEmail = require('./send-email')
const SesGateway = require('../gateways/ses-gateway')

describe('send-email', () => {
  test('send email when there was no previous record and tickets are available', async () => {
    const update = {
      new: {
        date: '20500101',
        timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
        url: 'https://tickets?id=99-20500101',
      },
    }

    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    await usecase.execute({ update })

    expect(sesGateway.send).toHaveBeenCalledWith(update.new)
  })

  test('send email when tickets have become available', async () => {
    const update = {
      old: {
        date: '20500101',
        timeslots: [],
        url: 'https://tickets?id=99-20500101',
      },
      new: {
        date: '20500101',
        timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
        url: 'https://tickets?id=99-20500101',
      },
    }

    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    await usecase.execute({ update })

    expect(sesGateway.send).toHaveBeenCalledWith(update.new)
  })

  test('do not send email if tickets were already available', async () => {
    const update = {
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
    }

    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    await usecase.execute({ update })

    expect(sesGateway.send).not.toHaveBeenCalled()
  })

  test('do not send email if tickets are not available', async () => {
    const update = {
      new: {
        date: '20500101',
        timeslots: [],
        url: 'https://tickets?id=99-20500101',
      },
    }

    const sendEmail = jest.fn()
    const sesGateway = SesGateway({ sendEmail })
    jest.spyOn(sesGateway, 'send')
    const usecase = SendEmail({ sesGateway })

    await usecase.execute({ update })

    expect(sesGateway.send).not.toHaveBeenCalled()
  })
})
