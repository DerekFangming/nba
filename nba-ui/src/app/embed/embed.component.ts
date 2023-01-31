import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.css']
})
export class EmbedComponent implements OnInit {

  embedUrl = ''
  src: SafeResourceUrl
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe( paramMap => {
      if (paramMap.url) {
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(paramMap.url)
      }
    })
  }// https://1stream.eu/game/orlando-magic-philadelphia-76ers-live-stream/559879

  generateEmbed() {
    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: {url: this.embedUrl}, 
        queryParamsHandling: 'merge'
      })
  }

}
