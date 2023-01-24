const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const request = require('request')
const weakStreamResolver = require('./stream-resolver/weak-stream-resolver')

const axios = require('axios')

const app = express()
app.use(bodyParser.json({limit: '100mb'}), cors())
const port = '9004'

matches = []

async function findMatches() {

  // console.log('1111111111111111111111111111')
  // let aa = await axios.get('https://nbastreams.app')
  // console.log('222222222222222222222222222222')
  // console.log(aa)

  request('https://nbastreams.app', function (error, response, body) {
    if (!error && response.statusCode == 200) {

      matches = []
      var tableRegex = new RegExp("<table.*?matchTable.*?\/table>", "g")
      var tables = tableRegex.exec(body)
      if (tables.length == 1) {

        const matchRegex = /<td>.*?\/td>.*?<\/td>/g
        const rawMatches = tables[0].matchAll(matchRegex)
        
        for (const m of rawMatches) {
          let match = {teams:[]}

          let matchDetailRegex = new RegExp('matchItem--home.*?name">(.*?)<.*?(https.*?\.png).*?(https.*?\.png).*?-->(.*?)<', 'g')
          var matchDetail = matchDetailRegex.exec(m[0])
          match.teams.push({
            name: matchDetail[1],
            icon: matchDetail[2]
          })
          match.teams.push({
            name: matchDetail[4],
            icon: matchDetail[3]
          })
          
          match.status = m[0].includes('LIVE') ? 'live' : m[0].includes('FT') ? 'ended' : 'upcoming'

          var detailRegex = new RegExp("href=\"\/(detail-match.*?)\"", "g")
          var detail = detailRegex.exec(m[0])
          var id = detail[1].substring(detail[1].lastIndexOf("/") + 1, detail[1].length);
          match.id = id

          if (match.status != 'upcoming') {
            let scoreRegex = new RegExp('matchItem--info">(.*?) - (.*?)<', 'g')
            var score = scoreRegex.exec(m[0])
            match.teams[0].score = score[1]
            match.teams[1].score = score[2]
          } else {
            let timeRegex = new RegExp('<time>(.*?)<', 'g')
            var time = timeRegex.exec(m[0])
            match.time = time[1]
          }

          matches.push(match)
        }
      }
    } else {
      console.error('Failed to load matches')
    }
  })
}

app.get('/matches', async (req, res) => {
  res.send({data: matches})
})

app.get('/matches/:matchId', async (req, res) => {

  request(`https://scdn.dev/main-assets/${req.params.matchId}/basketball`, async function (error, response, body) {
    if (!error && response.statusCode == 200) {

      let matchDetail = {}

      var techClipsRegex = new RegExp('https:\/\/techclips.net.*?"', 'g')
      var techClips = techClipsRegex.exec(body)
      if (techClips != null) {
        let techClipsUrl = techClips[0]
        techClipsUrl = techClipsUrl.substring(0, techClipsUrl.length - 1)
        techClipsUrl = techClipsUrl.replace(/\/[0-9].*?\//g, '/clip/') + '.html'
        matchDetail.techClips = techClipsUrl
      }

      let weakStreamUrl = ''
      var weakStreamRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
      var weakStream = weakStreamRegex.exec(body)

      if (weakStream == null) {
        let match = matches.find( m => m.id == req.params.matchId )
        await weakStreamResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name)
        res.send(matchDetail)
        return
      } else {
        weakStreamUrl = weakStream[0]
        weakStreamUrl = weakStreamUrl.substring(0, weakStreamUrl.length - 1)
      }
      

      request(weakStreamUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {

          var iframeRegex = new RegExp("&lt;iframe.*?\/iframe&gt;", "g")
          var iframe = iframeRegex.exec(body)

          var embedRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
          var embed = embedRegex.exec(iframe[0])
          let embedUrl = embed[0]
          embedUrl = embedUrl.substring(0, embedUrl.length - 1)
          matchDetail.weakStream = embedUrl
          res.send(matchDetail)
        } else {
          res.send(matchDetail)
        }
      })
    } else {
      res.send({data: 'Failed to load match details'})
    }
  })
  
})

app.get('/test', async (req, res) => {

  let matchDetail = {}
  weakStreamResolver.resolve(matchDetail, 'Milwaukee Bucks', 'Detroit Pistons')
  //console.log(matchDetail)
  res.send({})
})

app.use(express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
  console.log(`NBA app started on port ${port}`)
})

findMatches()
setInterval(function() {
  findMatches()
}, 60000)
