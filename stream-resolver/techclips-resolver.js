
const axios = require('axios')

async function resolve(result, teamName1, teamName2) {
  if (result.techClips != null) return

  console.log('Resolving techClips')
  try {
    let res = await axios.get('https://techclips.net/schedule/nbastreams/')

    // Find url
    const matchRegex = /href="\/(202.*?)".*h3.*?>(.*?)vs(.*?)</g
    const matches = res.data.matchAll(matchRegex)
    
    for (const match of matches) {
      let teamRes1 = match[2].toLowerCase().trim()
      let teamRes2 = match[3].toLowerCase().trim()

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