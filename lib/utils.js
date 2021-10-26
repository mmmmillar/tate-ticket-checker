module.exports = {
  getPage: async (browser, url) => {
    try {
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle0' })
      return await page.evaluate(() => document.body.innerHTML)
    } catch (error) {
      console.log(error)
      return ''
    }
  },
}
