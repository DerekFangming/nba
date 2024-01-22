
const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.weakStream != null) return

  console.log('Resolving weakstream')
  await attemptToResolve(result, teamName2, teamName1)
  if (result.weakStream == null) await attemptToResolve(result, teamName1, teamName2)
  if (result.weakStream == null) await attemptToResolve(result, teamName2, teamName1, '-2')
  if (result.weakStream == null) await attemptToResolve(result, teamName1, teamName2, '-2')
}

async function attemptToResolve(result, teamName1, teamName2, suffix = '') {
  let url = 'https://weakspell.to/nba-stream/' +
    (teamName1.split(' ').join('-') + '-vs-' + teamName2.split(' ').join('-')).toLowerCase() + suffix
  try {
    let res = await axios.get(url)
    let $ = cheerio.load(res.data)

    $ = cheerio.load($('textarea').first().text())
    result.weakStream = $('iframe').first().attr('src')

    console.log('resolved ' + result.weakStream)
  } catch(error) {
    console.log(`Failed to resolve ${url}, status code ${error}`)
  }
}

module.exports = { resolve }