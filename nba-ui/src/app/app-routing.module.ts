import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { EmbedComponent } from './embed/embed.component';
import { NbaComponent } from './nba/nba.component';
import { OtherComponent } from './other/other.component';


const routes: Routes = [
  { path: '', component: NbaComponent},
  { path: 'others', component: OtherComponent},
  { path: 'embed', component: EmbedComponent},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
