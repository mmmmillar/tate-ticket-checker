module.exports = ({ dynamoGateway }) => ({
  execute: async ({ timeslots }) => {
    await dynamoGateway.writeTimeslots(timeslots)
  },
})
