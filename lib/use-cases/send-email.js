module.exports = ({ sesGateway }) => ({
  execute: async ({ update }) => {
    if (update.old && update.old.timeslots.length > 0) return
    if (!update.new) return
    if (update.new && update.new.timeslots.length === 0) return
    await sesGateway.send(update.new)
  },
})
