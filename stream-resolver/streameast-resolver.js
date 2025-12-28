const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.gmrStream != null) return

  console.log('Resolving streameast Stream')
  try {
    let res = await axios.get('https://xstreameast.com/categories/nba/')
    // Find url

    let matchUrl
    let $ = cheerio.load(res.data)
    $('a').each(function(i, aa){
      if (matchUrl != null) return

      let matchPageUrl = $(aa).attr('href').toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').trim()

      if (matchPageUrl.includes(teamName1.toLowerCase()) || matchPageUrl.includes(teamName2.toLowerCase()) ) {
        matchUrl = $(aa).attr('href')
        return
      }

    })

    res = await axios.get(matchUrl)
    $ = cheerio.load(res.data)

    if ($('iframe').first().attr('src') != 'about:blank') {
      result.streameast = $('iframe').first().attr('src')
    }

  } catch(error) {
    console.log(`Failed to resolve streameast, error is: ${error}`)
  }

}

module.exports = { resolve }