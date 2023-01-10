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

  constructor(private http: HttpClient, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.http.get<any>(environment.urlPrefix + 'matches').subscribe(res => {
      if (res.data) {
        this.matches = res.data
      }

      // $("#errorModal").modal('show')
      
      if (this.matches.length >= 1) {
        this.loadStream(0)
      }
    }, error => {
      alert(error)
    })
  }

  loadStream(playingIdx: number) {
    this.playingIdx = playingIdx
    let url = this.matches[playingIdx]['id']
    this.http.get<any>(environment.urlPrefix + 'matches/' + url).subscribe(res => {
      if (res.embed) {
        this.src = res.embed
      }
    }, error => {
      alert(error)
    })
  }

}
