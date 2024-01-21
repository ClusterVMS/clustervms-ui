import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewCameraComponent } from './new-camera/new-camera.component';
import { SingleCameraViewComponent } from './single-camera-view/single-camera-view.component';
import { VideoGridComponent } from './video-grid/video-grid.component';

const routes: Routes = [
	{ path: "", redirectTo: "/overview", pathMatch: "full" },
	{ path: "cameras/:id", redirectTo: "cameras/:id/live" },
	{ path: "cameras/:id/:camView", component: SingleCameraViewComponent },
	{ path: "new-camera", component: NewCameraComponent },
	{ path: "overview", component: VideoGridComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
