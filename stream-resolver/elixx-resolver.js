
const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.elixx != null) return
  console.log (teamName1 + ' vs ' + teamName2)

  console.log('Resolving elixx')

  try {
    let res = await axios.get('https://elixx.xyz/schedule.html')
    let $ = cheerio.load(res.data)

    let matchUrl
    $('body').first().children().each(async function(i, c) {
      if (result.elixx != null) return
      if (matchUrl != null) return
      if ($(c)[0].name != 'button') return
      let title = $(c).html().toLocaleLowerCase()
      if (title.includes(teamName1.toLocaleLowerCase()) && title.includes(teamName2.toLocaleLowerCase())) {
        matchUrl = $(c).next().find('a').first().attr("href")
      }

    })

    res = await axios.get(matchUrl)
    $ = cheerio.load(res.data)
    $ = cheerio.load($('textarea').first().text())

    result.elixx = $('iframe').first().attr('src')
  } catch(error) {
    console.log(`Failed to resolve elixx, error is: ${error}`)
  }
}

module.exports = { resolve }