const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const techclipsResolver = require('./stream-resolver/techclips-resolver')
const weakStreamResolver = require('./stream-resolver/weak-stream-resolver')
const nbaStreamsResolver = require('./stream-resolver/nbastreams-app-resolver')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')

require('log-timestamp')(function() { return '[' + new Date().toLocaleString() + '] %s' });

const app = express()
app.use(bodyParser.json({limit: '100mb'}), cors())
const port = '9004'

matches = []

async function findMatches() {

  try {
    let res = await axios.get(`https://nbastreams.app`)

    matches = []
      var tableRegex = new RegExp("<table.*?matchTable.*?\/table>", "g")
      var tables = tableRegex.exec(res.data)
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

          var detailRegex = new RegExp("href=\"\/live\/(.*?)\"", "g")
          var detail = detailRegex.exec(m[0])
          var id = detail[1]
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
  } catch(error) {
    console.log(`Failed to load matches: ${error}`)
    throw error
  }
}

app.get('/matches', async (req, res) => {
  res.send({data: matches})
})

app.get('/matches/:matchId', async (req, res) => {
  let matchDetail = {}
  let match = matches.find( m => m.id == req.params.matchId)
  await nbaStreamsResolver.resolve(matchDetail, req.params.matchId)
  await weakStreamResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name)
  await techclipsResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name)
  res.send(matchDetail)
})

app.get('/test', async (req, res) => {

  let matchDetail = {}
  weakStreamResolver.resolve(matchDetail, 'Milwaukee Bucks', 'Detroit Pistons')
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
