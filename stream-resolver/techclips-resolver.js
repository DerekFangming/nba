
const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.techClips != null) return

  console.log('Resolving techClips')
  try {
    let res = await axios.get('https://techclips.net/schedule/nbastreams/')
    // Find url
    const $ = cheerio.load(res.data)
    $('table').first().find('tr').each(function(i, tr){
      if (result.techClips != null) return
      if ($(tr).find('td').first().text().trim() != '') return

      let anchor = $(tr).find('td').last().children().first()

      let teams = anchor.html().split(/[^A-Za-z0-9]/)
      teams = teams.filter(e => e.trim() != '')
      if (teams.length != 2) return

      let teamRes1 = teams[0].toLowerCase().trim()
      let teamRes2 = teams[1].toLowerCase().trim()

      if ((teamName1.toLowerCase().includes(teamRes1) && teamName2.toLowerCase().includes(teamRes2) ) ||
      (teamName1.toLowerCase().includes(teamRes2) && teamName2.toLowerCase().includes(teamRes1))) {

        let urls = $(anchor).attr("href").split(/[^A-Za-z0-9]/)
        urls = urls.filter(e => e.trim() != '')
        if (urls.length != 2) return

        result.techClips = `https://techclips.net/clip/${urls[1]}.html`
        return
      }
    })

  } catch(error) {
    console.log(`Failed to resolve techClips, error is: ${error}`)
  }

}

module.exports = { resolve }