const axios = require('axios')

async function resolve(result, matchId) {

  if (result.weakStream != null && result.techClips != null) return

  try {
    let res = await axios.get(`https://scdn.dev/main-assets/${matchId}/basketball`)

    // Load techClips if not loaded
    if (result.techClips == null) {
      var techClipsRegex = new RegExp('https:\/\/techclips.net.*?"', 'g')
      var techClips = techClipsRegex.exec(res.data)
      if (techClips != null) {
        let techClipsUrl = techClips[0]
        techClipsUrl = techClipsUrl.substring(0, techClipsUrl.length - 1)
        techClipsUrl = techClipsUrl.replace(/\/[0-9].*?\//g, '/clip/') + '.html'
        result.techClips = techClipsUrl
      }
    }

    // Load weakStream if not loaded
    if (result.weakStream == null) {
      try {
        var weakStreamRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
        var weakStream = weakStreamRegex.exec(res.data)

        if (weakStream != null) {
          let weakStreamUrl = weakStream[0]
          weakStreamUrl = weakStreamUrl.substring(0, weakStreamUrl.length - 1)

          let weakStreamRes = await axios.get(weakStreamUrl)
          var iframeRegex = new RegExp("&lt;iframe.*?\/iframe&gt;", "g")
          var iframe = iframeRegex.exec(weakStreamRes.data)

          var embedRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
          var embed = embedRegex.exec(iframe[0])
          let embedUrl = embed[0]
          embedUrl = embedUrl.substring(0, embedUrl.length - 1)
          result.weakStream = embedUrl
        }
    
      } catch(error) {
        console.log(`Failed to resolve weakStream from nbastreams.app: ${error}`)
      }
    }

  } catch(error) {
    console.log(`Failed to resolve techClips from nbastreams.app: ${error}`)
  }
}

module.exports = { resolve }
