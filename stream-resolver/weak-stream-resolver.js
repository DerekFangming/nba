
const axios = require('axios')

async function resolve(result, teamName1, teamName2) {
  if (result.weakStream != null) return

  console.log('resolving weakstream')
  await attemptToResolve(result, teamName2, teamName1)
  if (result.weakStream == null) await attemptToResolve(result, teamName1, teamName2)
  if (result.weakStream == null) await attemptToResolve(result, teamName2, teamName1, '-2')
  if (result.weakStream == null) await attemptToResolve(result, teamName1, teamName2, '-2')
}

async function attemptToResolve(result, teamName1, teamName2, suffix = '') {
  let url = 'https://weakstream.org/nba-stream/' +
    (teamName1.split(' ').join('-') + '-vs-' + teamName2.split(' ').join('-')).toLowerCase() + suffix
  try {
    let res = await axios.get(url)

    // Find url
    var iframeRegex = new RegExp("&lt;iframe.*?\/iframe&gt;", "g")
    var iframe = iframeRegex.exec(res.data)

    var embedRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
    var embed = embedRegex.exec(iframe[0])
    let embedUrl = embed[0]
    embedUrl = embedUrl.substring(0, embedUrl.length - 1)
    result.weakStream = embedUrl

    console.log('resolved ' + url)
  } catch(error) {
    console.log(`Failed to resolve ${url}, status code ${error}`)
  }
}

module.exports = { resolve }