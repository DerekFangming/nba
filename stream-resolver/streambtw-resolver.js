
const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.streambtw != null) return
  console.log (teamName1 + ' vs ' + teamName2)

  console.log('Resolving streambtw')

  try {
    let res = await axios.get('https://streambtw.com/')
    let $ = cheerio.load(res.data)

    // let matchUrl
    $('a').each(async function(i, a) {
      if (result.streambtw != null) return

      let title = $(a).html().toLocaleLowerCase()
      if (title.includes(teamName1.toLocaleLowerCase()) && title.includes(teamName2.toLocaleLowerCase())) {
        result.streambtw = $(a).attr("href")
      }


    })
  } catch(error) {
    console.log(`Failed to resolve streambtw, error is: ${error}`)
  }
}

module.exports = { resolve }