const handlebars = require('handlebars')
const { format, parse } = require('date-fns')

const formatDate = (date) =>
  format(parse(date, 'yyyyMMdd', new Date()), 'dd/MM/yyyy')

const createEmailBody = (timeslot) => {
  const template = handlebars.compile(
    `<p>Hi there!</p>` +
      `<p>Some tickets to the event you're following have become available:</p>` +
      `<p>` +
      `<a href="{{{timeslot.url}}}">{{{timeslot.url}}}</a><br/>` +
      `Date: {{timeslot.date}}<br/>` +
      `Times: {{timeslot.timeslots}}` +
      `</p>`
  )
  return template({ timeslot })
}

const transformTimeslots = (timeslot) => {
  return {
    date: formatDate(timeslot.date),
    timeslots: timeslot.timeslots.map((t) => t.time),
    url: process.env.TICKET_URL.replace('##ID##', timeslot.eventId).replace(
      '##DATE##',
      timeslot.date
    ),
  }
}

module.exports = ({ sendEmail }) => {
  return {
    send: async (timeslot) => {
      const request = {
        Destination: {
          ToAddresses: [process.env.EMAIL_ADDRESS],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: createEmailBody(transformTimeslots(timeslot)),
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `Tate tickets available for ${formatDate(timeslot.date)}`,
          },
        },
        Source: process.env.EMAIL_ADDRESS,
      }

      await sendEmail(request)
    },
  }
}
