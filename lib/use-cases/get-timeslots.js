const { format } = require('date-fns')

module.exports = ({ timeslotGateway }) => ({
  execute: async ({ days = 1 }) => {
    const requests = []

    for (i = 0; i < days; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + i)
      const dateString = format(startDate, 'yyyyMMdd')

      requests.push(timeslotGateway.getTimeslotsForDate(dateString))
    }

    const results = await Promise.all(requests)

    return results
      .filter((result) => result.timeslots.length > 0)
      .map((result) => ({
        date: result.date,
        timeslots: result.timeslots.map((timeslot) => ({
          time: timeslot.time.match(/\d{1,2}:\d{2}(am|pm)/)[0],
        })),
        url: result.url,
      }))
  },
})
