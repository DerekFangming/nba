
const axios = require('axios')

async function resolve(result, teamName1, teamName2) {
  if (result.techClips != null) return

  console.log('Force resolving techClips')
  try {
    let res = await axios.get('https://techclips.net/schedule/nbastreams/')

    // Find url
    const matchRegex = /href="\/.*?\/(.*?)\/".*?>(.*?) @ (.*?)</g
    const matches = res.data.matchAll(matchRegex)
    
    for (const match of matches) {
      let teamRes1 = match[2].toLowerCase().trim()
      let teamRes2 = match[3].toLowerCase().trim()

      if ((teamName1.toLowerCase().includes(teamRes1) && teamName2.toLowerCase().includes(teamRes2) ) || (
        teamName1.toLowerCase().includes(teamRes2) || teamName2.toLowerCase().includes(teamRes1))) {
          result.techClips = `https://techclips.net/clip/${match[1]}.html`
          return
        }
    }

  } catch(error) {
    console.log(`Failed to resolve techClips, error is: ${error}`)
  }

}

async function attemptToResolve(result, teamName1, teamName2) {
  let url = 'https://weakstream.org/nba-stream/' +
    (teamName1.split(' ').join('-') + '-vs-' + teamName2.split(' ').join('-')).toLowerCase()
  try {
    let res = await axios.get('https://techclips.net/schedule/nbastreams/')

    // Find url
    var iframeRegex = new RegExp("&lt;iframe.*?\/iframe&gt;", "g")
    var iframe = iframeRegex.exec(res.data)

    var embedRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
    var embed = embedRegex.exec(iframe[0])
    let embedUrl = embed[0]
    embedUrl = embedUrl.substring(0, embedUrl.length - 1)
    result.weakStream = embedUrl

  } catch(error) {
    console.log(`Failed to resolve ${url}, status code ${error}`)
  }
}

module.exports = { resolve }