import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { VideoGridComponent } from './video-grid/video-grid.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

@NgModule({
	declarations: [
		AppComponent,
		VideoGridComponent,
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
