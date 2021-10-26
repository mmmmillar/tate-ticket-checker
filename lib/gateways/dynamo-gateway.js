const parse = require('date-fns/parse')
const add = require('date-fns/add')
const { marshall } = require('@aws-sdk/util-dynamodb')

const getTtl = (date) => {
  const eventDate = parse(date, 'yyyyMMdd', new Date())
  const dayAfterEventDate = add(eventDate, { days: 1 })
  return dayAfterEventDate.getTime() / 1000
}

module.exports = ({ sendBatchWriteRequest }) => {
  return {
    writeTimeslots: async (timeslots) => {
      const request = {
        RequestItems: {
          [`${process.env.DYNAMO_TABLE_NAME}`]: timeslots.map((day) => {
            return {
              PutRequest: {
                Item: {
                  pk: { S: `#EVENT#${process.env.EVENT_ID}` },
                  sk: { S: `#DATE#${day.date}` },
                  timeslots: {
                    L: day.timeslots.map((timeslot) => ({
                      M: marshall(timeslot),
                    })),
                  },
                  ttl: {
                    N: `${getTtl(day.date)}`,
                  },
                },
              },
            }
          }),
        },
      }

      await sendBatchWriteRequest(request)
    },
  }
}
