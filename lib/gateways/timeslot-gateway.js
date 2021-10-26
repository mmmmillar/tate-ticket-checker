const cheerio = require('cheerio')

module.exports = ({ browser, getPage }) => {
  return {
    getTimeslotsForDate: async (date) => {
      const url = process.env.TICKET_URL.replace(
        '##ID##',
        process.env.EVENT_ID
      ).replace('##DATE##', date)

      const page = await getPage(browser, url)
      const $ = cheerio.load(page)

      const timeslots = $('.timeslot')
        .map((_, slot) => $(slot).text().trim())
        .toArray()
        .filter((slot) => !slot.toLowerCase().includes('sold out'))
        .map((slot) => ({ time: slot.match(/\d{1,2}:\d{2}(am|pm)/)[0] }))

      return { date, timeslots, url }
    },
  }
}
