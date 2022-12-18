import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VideoGridComponent } from './video-grid/video-grid.component';

const routes: Routes = [
	{ path: "", redirectTo: "/overview", pathMatch: "full" },
	{ path: "overview", component: VideoGridComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
