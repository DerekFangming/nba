import { HttpClient } from '@angular/common/http'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
declare var $: any

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nba',
  templateUrl: './nba.component.html',
  styleUrls: ['./nba.component.css']
})
export class NbaComponent implements OnInit, OnDestroy {

  title = 'nba-ui'
  matches = []
  src: SafeResourceUrl
  streamId = ''
  timerInterval: any

  weakStream: string = null
  techClips: string = null
  bestsolaris: string = null
  playingUrl: string = null

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
    this.timerInterval = setInterval(function() {
      that.loadMatches()
    }, 15000)
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval)
 }

  loadMatches(init = false) {
    if (init) this.loadingMatches = true
    this.http.get<any>(environment.urlPrefix + 'matches').subscribe(res => {
      
      if (init) this.loadingMatches = false
      
      this.matches = res
      if (this.matches.length == 0 && init) {
        this.infoTitle = '未找到比赛'
        this.infoDescription = '当前没有比赛，请稍后再试。'
        $("#infoModal").modal('show')
        return
      }

      // Try to load stream ID if it's passed in from query param
      if (this.streamId != '') {
        let match = this.matches.find(m => m.id == this.streamId)
        if (match == null || match.status != 'live') {
          this.streamId = ''
          this.router.navigate(
            [], 
            {
              relativeTo: this.route,
              queryParams: {}, 
              queryParamsHandling: 'merge'
            })
        }
      }

      if (init) {
        if (this.streamId == '') {
          let match = this.matches.find(m => m.status == 'live')
          if (match != null) {
            this.loadStream(match.id)
          }
        } else {
          this.loadStream(this.streamId)
        }
      }


    }, error => {
      if (init) this.loadingMatches = false
      if (init) {
        this.infoTitle = '无法加载比赛'
        if (error.status != null && error.status != 200) {
          this.infoDescription = '无法连接到服务器'
        } else if (error.message) {
          this.infoDescription = error.message
        } else {
          console.log(error)
          this.infoDescription = '系统错误'
        }
        $("#infoModal").modal('show')
      }
    })
  }

  loadStream(streamId: string) {
    let match = this.matches.find(m => m.id == streamId)
    if (match == null || match.status != 'live') return

    this.src = null
    this.loadingMatcheDetails = true
    this.streamId = streamId
    this.http.get<any>(environment.urlPrefix + 'matches/' + streamId).subscribe(res => {
      this.loadingMatcheDetails = false
      if (res.weakStream || res.techClips || res.bestsolaris) {
        this.playingUrl = res.weakStream ? res.weakStream : res.techClips? res.techClips : res.bestsolaris
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.playingUrl)
        this.weakStream = res.weakStream
        this.techClips = res.techClips
        this.bestsolaris = res.bestsolaris

        this.router.navigate(
          [], 
          {
            relativeTo: this.route,
            queryParams: {streamId: streamId}, 
            queryParamsHandling: 'merge'
          })
      } else {
        this.infoTitle = '系统错误'
        this.infoDescription = '未找到直播地址'
        $("#infoModal").modal('show')
      }
    }, error => {
      this.loadingMatcheDetails = false
      this.infoTitle = '系统错误'
      this.infoDescription = error
      $("#infoModal").modal('show')
    })
  }

  playStream(streamUrl: string) {
    this.playingUrl = streamUrl
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(streamUrl)
  }

  getStartTime(time: string) {
    let timeStr = new Date(time).toLocaleTimeString()
    let timeParts = timeStr.split(' ')
    return timeParts[0].slice(0, -3) + ' ' + timeParts[1]
  }

  getVidHeight() {
    return window.innerWidth >= 960 ? {height: '90vh'} : {height: '40vh'}
  }

  getMenuHeight() {
    return window.innerWidth >= 960 ? {height: '90vh'} : {height: '55vh'}
  }

}
