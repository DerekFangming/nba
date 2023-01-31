import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.css']
})
export class EmbedComponent implements OnInit {

  src: SafeResourceUrl
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe( paramMap => {
      if (paramMap.url) {
        console.log(paramMap.url)
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(paramMap.url)
      } else {
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl('https://bestsolaris.com/solaris.php?postid=29493')
        
      }
    })
  }

}
