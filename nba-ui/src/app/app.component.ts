import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
declare var $: any

import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'nba-ui'
  matches = []
  src = ''
  playingIdx = 0

  infoTitle = ''
  infoDescription = ''

  loadingMatches = true

  constructor(private http: HttpClient, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.loadingMatches = true
    this.http.get<any>(environment.urlPrefix + 'matches').subscribe(res => {
      this.loadingMatches = false
      if (res.data) {
        this.matches = res.data
      }
      
      if (this.matches.length >= 1) {
        this.loadStream(0)
      } else {
        this.infoTitle = '未找到比赛'
        this.infoDescription = '当前没有比赛，请稍后再试。'
        $("#infoModal").modal('show')
      }

    }, error => {
      this.loadingMatches = false
      this.infoTitle = '系统错误'
      this.infoDescription = error
      $("#infoModal").modal('show')
    })
  }

  loadStream(playingIdx: number) {
    this.playingIdx = playingIdx
    let url = this.matches[playingIdx]['id']
    this.http.get<any>(environment.urlPrefix + 'matches/' + url).subscribe(res => {
      if (res.embed) {
        this.src = res.embed
      } else {
        this.infoTitle = '系统错误'
        this.infoDescription = '未找到embed地址'
        $("#infoModal").modal('show')
      }
    }, error => {
      this.infoTitle = '系统错误'
      this.infoDescription = error
      $("#infoModal").modal('show')
    })
  }

}
