process.env.EMAIL_ADDRESS = 'me@me.com'
process.env.TICKET_URL = 'https://tickets?id=##ID##-##DATE##'

const SesGateway = require('./ses-gateway')

describe('ses-gateway', () => {
  describe('send', () => {
    test('formats and sends the email', async () => {
      const sendEmail = jest.fn()
      const gateway = SesGateway({ sendEmail })
      const timeslot = {
        date: '20500102',
        eventId: '99',
        timeslots: [{ time: '3:15pm' }, { time: '3:30pm' }],
      }

      await gateway.send(timeslot)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: [process.env.EMAIL_ADDRESS] },
        })
      )
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Message: expect.objectContaining({
            Body: {
              Html: expect.objectContaining({
                Data: expect.stringContaining(
                  '<a href="https://tickets?id=99-20500102">https://tickets?id=99-20500102</a><br/>Date: 02/01/2050<br/>Times: 3:15pm,3:30pm'
                ),
              }),
            },
          }),
        })
      )
    })
  })
})
