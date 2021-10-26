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

    const results = await Promise.all(requests)

    return results.filter((result) => result.timeslots.length > 0)
  },
})
