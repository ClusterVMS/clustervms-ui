import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { VideoPlayerComponent } from './video-player/video-player.component';

@NgModule({
	declarations: [
		AppComponent,
		VideoPlayerComponent,
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		HttpClientModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
