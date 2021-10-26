const parse = require('date-fns/parse')
const add = require('date-fns/add')
const { marshall } = require('@aws-sdk/util-dynamodb')

module.exports = ({ sendBatchWriteRequest }) => {
  return {
    writeTimeslots: async (timeslots) => {
      const request = {
        RequestItems: {
          [`${process.env.DYNAMO_TABLE_NAME}`]: timeslots.map((day) => {
            const ttl =
              add(parse(day.date, 'yyyyMMdd', new Date()), {
                days: 1,
              }).getTime() / 1000

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
                    N: `${ttl}`,
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
