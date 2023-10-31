const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.gmrStream != null) return

  console.log('Resolving GMR Stream')
  try {
    let res = await axios.get('https://official.givemeredditstream.cc/nba')
    // Find url

    let matchUrl
    let $ = cheerio.load(res.data)
    $('a.matches').each(async function(i, aa){
      if (matchUrl != null) return

      let parts = $(aa).attr('href').split('/')
      let last = parts.filter(e => e.trim() != '').pop()

      parts = last.split(/vs/)
      if (parts.length != 2) return

      let teamRes1 = parts[0].toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').trim()
      let teamRes2 = parts[1].toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').trim()

      if ((teamName1.toLowerCase().includes(teamRes1) && teamName2.toLowerCase().includes(teamRes2) ) ||
      (teamName1.toLowerCase().includes(teamRes2) && teamName2.toLowerCase().includes(teamRes1))) {
        matchUrl = 'https://official.givemeredditstream.cc' + $(aa).attr('href')
        return
      }

    })

    res = await axios.get(matchUrl)
    $ = cheerio.load(res.data)
    $ = cheerio.load($('textarea').first().text())

    result.gmrStream = $('iframe').first().attr('src')

  } catch(error) {
    console.log(`Failed to resolve gmrStream, error is: ${error}`)
  }

}

module.exports = { resolve }