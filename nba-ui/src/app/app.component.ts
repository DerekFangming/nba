import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
declare var $: any

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'nba-ui'
  matches = []
  src: SafeResourceUrl
  playingIdx = -1

  infoTitle = ''
  infoDescription = ''

  loadingMatches = true
  loadingMatcheDetails = true

  constructor(private http: HttpClient, public sanitizer: DomSanitizer) { }

  ngOnInit() {
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
        this.matches = res.data
      }
      
      if (init && this.matches.length >= 1) {
        console.log(111)
        this.loadStream(0)
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
    this.loadingMatcheDetails = true

    if (this.matches[playingIdx]['status'] != 'live') return
    this.playingIdx = playingIdx
    let url = this.matches[playingIdx]['id']
    this.http.get<any>(environment.urlPrefix + 'matches/' + url).subscribe(res => {
      this.loadingMatcheDetails = false
      if (res.embed) {
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(res.embed)
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

  getVidHeight() {
    return window.innerWidth >= 960 ? {height: '95vh'} : {height: '40vh'}
  }

  getMenuHeight() {
    return window.innerWidth >= 960 ? {height: '95vh'} : {height: '55vh'}
  }

}
