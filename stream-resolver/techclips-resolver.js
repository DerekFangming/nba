
const axios = require('axios')

async function resolve(result, teamName1, teamName2) {
  if (result.techClips != null) return

  console.log('Resolving techClips')
  try {
    let res = await axios.get('https://techclips.net/schedule/nbastreams/')
    // Find url
    const matchRegex = /href="\/(202.*?)".*?2">(.*?)<\//g
    const matches = res.data.replace(/(\r\n|\n|\r)/gm, '').matchAll(matchRegex)
    
    for (const match of matches) {
      let teams = match[2].split("vs")
      if (teams.length != 2) continue
      
      let teamRes1 = teams[0].toLowerCase().replace(/series/g, '').trim()
      let teamRes2 = teams[1].toLowerCase().replace(/series/g, '').trim()

      if ((teamName1.toLowerCase().includes(teamRes1) && teamName2.toLowerCase().includes(teamRes2) ) || (
        teamName1.toLowerCase().includes(teamRes2) && teamName2.toLowerCase().includes(teamRes1))) {
          result.techClips = `https://techclips.net/clip/${match[1]}.html`
          return
        }
    }

  } catch(error) {
    console.log(`Failed to resolve techClips, error is: ${error}`)
  }

}

module.exports = { resolve }