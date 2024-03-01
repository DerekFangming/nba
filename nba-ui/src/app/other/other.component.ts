import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
declare var $: any

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.css']
})
export class OtherComponent implements OnInit, OnDestroy {

  matches = []
  src: SafeResourceUrl
  loadingMatches = false
  timerInterval: any

  infoTitle = ''
  infoDescription = ''
  playingUrl: string = null

  title = ''
  link = ''

  constructor(private http: HttpClient, public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    let that = this
    this.loadMatches(true)
    this.timerInterval = setInterval(function() {
      that.loadMatches()
    }, 15000)
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
 }

  loadMatches(init = false) {
    if (init) this.loadingMatches = true
    this.http.get<any>(environment.urlPrefix + 'other-matches').subscribe(res => {
      
      if (init) this.loadingMatches = false
      
      this.matches = res
      if (this.matches.length == 0 && init) {
        this.infoTitle = '未找到比赛'
        this.infoDescription = '当前没有比赛，请稍后再试。'
        $("#infoModal").modal('show')
        return
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

  playStream(streamUrl: string) {
    this.playingUrl = streamUrl
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(streamUrl)
  }

  getVidHeight() {
    return window.innerWidth >= 960 ? {height: '90vh'} : {height: '40vh'}
  }

  getMenuHeight() {
    return window.innerWidth >= 960 ? {height: '90vh'} : {height: '55vh'}
  }

  showAddMatchModal() {
    $("#addMatchModal").modal('show')
  }

  addMatch() {
    if (this.link.trim() == '') {
      return
    }

    let match = {title: this.title, link: this.link}
    this.http.post<any>(environment.urlPrefix + 'other-matches', match).subscribe(res => {
      this.matches.push(match)
      $("#addMatchModal").modal('hide')
    }, error => {
      alert(error)
    })

  }

}
