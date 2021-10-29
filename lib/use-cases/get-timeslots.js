const format = require('date-fns/format')

module.exports = ({ timeslotGateway }) => ({
  execute: async ({ days = 1 }) => {
    const requests = []

    for (i = 0; i < days; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + i)
      requests.push(
        timeslotGateway.getTimeslotsForDate(format(startDate, 'yyyyMMdd'))
      )
    }

    return await Promise.all(requests)
  },
})
