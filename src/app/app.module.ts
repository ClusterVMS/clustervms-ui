import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NewCameraComponent } from './new-camera/new-camera.component';
import { SingleCameraViewComponent } from './single-camera-view/single-camera-view.component';
import { VideoGridComponent } from './video-grid/video-grid.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

@NgModule({
	declarations: [
		AppComponent,
		NewCameraComponent,
		SingleCameraViewComponent,
		VideoGridComponent,
		VideoPlayerComponent,
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
	],
	providers: [
		provideHttpClient(withInterceptorsFromDi()),
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
