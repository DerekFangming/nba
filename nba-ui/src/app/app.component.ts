import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
declare var $: any

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'nba-ui'
  matches = []
  src: SafeResourceUrl
  streamId = ''
  playingIdx = -1

  infoTitle = ''
  infoDescription = ''

  loadingMatches = false
  loadingMatcheDetails = false

  constructor(private http: HttpClient, public sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe( paramMap => {
      if (paramMap.streamId) {
        this.streamId = paramMap.streamId
      }
    })

    let that = this
    this.loadMatches(true)
    setInterval(function() {
      that.loadMatches()
    }, 15000)
  }

  loadMatches(init = false) {
    if (init) this.loadingMatches = true
    this.http.get<any>(environment.urlPrefix + 'matches').subscribe(res => {
      if (init) this.loadingMatches = false
      if (res.data) {
        if (this.playingIdx != -1 && this.matches[this.playingIdx]['id'] != res.data[this.playingIdx]['id'] ) this.playingIdx = -1
        this.matches = res.data
      }
      
      if (init && this.matches.length >= 1) {
        let matchIdx = this.matches.findIndex(m => m.id == this.streamId)
        if (matchIdx == -1) {
          this.router.navigate(
            [], 
            {
              relativeTo: this.route,
              queryParams: {}, 
              queryParamsHandling: 'merge'
            })
          this.loadStream(0)
        } else {
          this.loadStream(matchIdx)
        }
      } else if (init) {
        this.infoTitle = '未找到比赛'
        this.infoDescription = '当前没有比赛，请稍后再试。'
        $("#infoModal").modal('show')
      }

    }, error => {
      if (init) this.loadingMatches = false
      if (init) {
        this.infoTitle = '系统错误'
        this.infoDescription = error
        $("#infoModal").modal('show')
      }
    })
  }

  loadStream(playingIdx: number) {
    if (this.matches[playingIdx]['status'] != 'live') return

    this.loadingMatcheDetails = true
    this.playingIdx = playingIdx
    let url = this.matches[playingIdx]['id']
    this.http.get<any>(environment.urlPrefix + 'matches/' + url).subscribe(res => {
      this.loadingMatcheDetails = false
      if (res.embed) {
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(res.embed)

        this.router.navigate(
          [], 
          {
            relativeTo: this.route,
            queryParams: {streamId: url}, 
            queryParamsHandling: 'merge'
          })
      } else {
        this.infoTitle = '系统错误'
        this.infoDescription = '未找到embed地址'
        $("#infoModal").modal('show')
      }
    }, error => {
      this.loadingMatcheDetails = false
      this.infoTitle = '系统错误'
      this.infoDescription = error
      $("#infoModal").modal('show')
    })
  }

  getStartTime(time: string) {
    let times = time.split(':')
    if (times.length != 2) return ''

    let now = new Date()
    now.setSeconds(0)
    now.setUTCHours(parseInt(times[0]))
    now.setUTCMinutes(parseInt(times[1]))
    let timeStr = now.toLocaleTimeString()
    let timeParts = timeStr.split(' ')
    return timeParts[0].slice(0, -3) + ' ' + timeParts[1]
  }

  getVidHeight() {
    return window.innerWidth >= 960 ? {height: '95vh'} : {height: '40vh'}
  }

  getMenuHeight() {
    return window.innerWidth >= 960 ? {height: '95vh'} : {height: '55vh'}
  }

}
