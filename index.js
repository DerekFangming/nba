const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const techclipsResolver = require('./stream-resolver/techclips-resolver')
const weakStreamResolver = require('./stream-resolver/weak-stream-resolver')
const bestsolarisResolver = require('./stream-resolver/bestsolaris-resolver')
const nbaStreamsResolver = require('./stream-resolver/nbastreams-app-resolver')
const gmrStreamsResolver = require('./stream-resolver/gmrstream-resolver')
const freevipliveResolver = require('./stream-resolver/freeviplive-resolver')
const { v4: uuidv4, NIL } = require('uuid')
const axios = require('axios')
const fs = require('fs')
const ExpiryMap = require('expiry-map')

require('log-timestamp')(function() { return '[' + new Date().toLocaleString() + '] %s' });

const app = express()
app.use(bodyParser.json({limit: '100mb'}), cors())
const port = '9004'

const cityNames = {
  'LA': 'Los Angeles'
}

refreshInterval = 60000

matches = []
matchDetailCache = new ExpiryMap(12 * 60 * 60 * 1000) // 12 hour
otherMatches = []

async function findMatches() {

  let requestGoesThrough = false
  try {
    let res = await axios.get(`https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`)
    let games = res.data.scoreboard.games

    matches = []
    requestGoesThrough = true
    for (let game of games) {

      let match = {teams:[]}
      let homeCity = cityNames[game.homeTeam.teamCity] ? cityNames[game.homeTeam.teamCity] : game.homeTeam.teamCity
      let awayCity = cityNames[game.awayTeam.teamCity] ? cityNames[game.awayTeam.teamCity] : game.awayTeam.teamCity
      match.teams.push({
        name: awayCity + ' ' + game.awayTeam.teamName,
        icon: `https://cdn.nba.com/logos/nba/${game.awayTeam.teamId}/primary/L/logo.svg`,
        score: game.awayTeam.score
      })
      match.teams.push({
        name: homeCity + ' ' + game.homeTeam.teamName,
        icon: `https://cdn.nba.com/logos/nba/${game.homeTeam.teamId}/primary/L/logo.svg`,
        score: game.homeTeam.score
      })

      match.id = game.gameId
      match.status = game.gameStatusText
      match.time = game.gameTimeUTC

      matches.push(match)
    }

  } catch(error) {
    console.error(`Failed to load matches: ${error}`)
  }

  if (requestGoesThrough && matches.find(m => m.status == 'live') != null) {
    setTimeout(function() { findMatches() }, 15000)
  } else {
    setTimeout(function() { findMatches() }, 60000)
  }
}

app.get('/matches', async (req, res) => {
  res.send(matches)
})

app.get('/matches/:matchId', async (req, res) => {
  let matchDetail = matchDetailCache.get(req.params.matchId)
  if (matchDetail == null) matchDetail = {}

  let match = matches.find( m => m.id == req.params.matchId)
  if (match != null) {
    console.log(`====================================================================`)
    console.log(`Loading matches: ${match.teams[0].name} vs ${match.teams[1].name}`)
    console.log(`====================================================================`)
    await Promise.all([
      // techclipsResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name), ????
      // gmrStreamsResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name),


      weakStreamResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name),
      bestsolarisResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name),
      freevipliveResolver.resolve(matchDetail, match.teams[0].name, match.teams[1].name),
    ])
  }
  matchDetailCache.set(req.params.matchId, matchDetail)

  res.send(Object.keys(matchDetail).map(k => matchDetail[k]).filter(v => v != null).sort((a, b) => a.includes('weakspell') ? -1 : 1))
})

app.get('/other-matches', async (req, res) => {
  res.send(otherMatches)
})

app.post('/other-matches', async (req, res) => {
  otherMatches = req.body
  res.send(otherMatches)
})

app.get('/clear-cache', async (req, res) => {
  matchDetailCache = new ExpiryMap(12 * 60 * 60 * 1000)
  res.send({})
})

app.get('/test', async (req, res) => {

  let matchDetail = {}
  await gmrStreamsResolver.resolve(matchDetail, 'Miami Heat', 'San Antonio Spurs')
  res.send(matchDetail)
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', function (req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf8', (err, text) => {
    res.send(text)
  })
})

app.listen(port, () => {
  console.log(`NBA app started on port ${port}`)
})

findMatches()
