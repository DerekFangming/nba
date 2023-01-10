const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const request = require('request')

const app = express()
app.use(bodyParser.json({limit: '100mb'}), cors())
const port = '9004'

app.get('/matches', async (req, res) => {

  request('https://nbastreams.app', function (error, response, body) {
    if (!error && response.statusCode == 200) {

      let matchRespons = []
      var tableRegex = new RegExp("<table.*?matchTable.*?\/table>", "g")
      var tables = tableRegex.exec(body)
      if (tables.length == 1) {

        const matchRegex = /<td>.*?\/td>.*?<\/td>/g
        const matches = tables[0].matchAll(matchRegex)
        
        for (const m of matches) {
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

          matchRespons.push(match)
        }
      }

      res.send({data: matchRespons})
    } else {
      res.send({error: 'Failed to load matches'})
    }
  })
})

app.get('/matches/:matchId', (req, res) => {

  request(`https://scdn.dev/main-assets/${req.params.matchId}/basketball`, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var streamRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
      var streams = streamRegex.exec(body)
      if (streams == null) {
        res.send({data: 'No stream is found'})
        return
      }
      let streamUrl = streams[0]
      streamUrl = streamUrl.substring(0, streamUrl.length - 1)
      

      request(streamUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {

          var iframeRegex = new RegExp("&lt;iframe.*?\/iframe&gt;", "g")
          var iframe = iframeRegex.exec(body)

          var embedRegex = new RegExp('https:\/\/weakstream.org.*?"', 'g')
          var embed = embedRegex.exec(iframe[0])
          let embedUrl = embed[0]
          embedUrl = embedUrl.substring(0, embedUrl.length - 1)
          res.send({embed: embedUrl})
        } else {
          res.send({data: 'Failed to load embed url'})
        }
      })
    } else {
      res.send({data: 'Failed to load match details'})
    }
  })
  
})

app.use(express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
  console.log(`NBA app started on port ${port}`)
})

