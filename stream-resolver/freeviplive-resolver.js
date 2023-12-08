const axios = require('axios')
const cheerio = require('cheerio')

async function resolve(result, teamName1, teamName2) {
  if (result.freeviplive != null) return

  console.log('Resolving freeviplive Stream')
  try {
    let res = await axios.get('https://freeviplive.com/')

    const $ = cheerio.load(res.data)
    $('table').first().find('tr').each(function(i, tr){
      if (result.freeviplive != null) return

      let type = $(tr).find('td').first().next().next()
      if (type.text() != 'NBA') return

      let title = type.next()
      let teams = title.text().split(/-/)
      if (teams.length != 2) return

      let teamRes1 = teams[0].toLowerCase().trim()
      let teamRes2 = teams[1].toLowerCase().trim()

      // console.log(title.text())

      if ((teamName1.toLowerCase().includes(teamRes1) && teamName2.toLowerCase().includes(teamRes2) ) ||
      (teamName1.toLowerCase().includes(teamRes2) && teamName2.toLowerCase().includes(teamRes1))) {
        result.freeviplive = title.next().children().first().attr("href")
        result.freevipliveSecond = title.next().next().children().first().attr("href")
      }
    })

  } catch(error) {
    console.log(`Failed to resolve freeviplive, error is: ${error}`)
  }

}

module.exports = { resolve }