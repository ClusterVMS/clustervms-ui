import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Camera } from '../camera';
import { CameraService } from '../camera.service';

@Component({
	selector: 'app-single-camera-view',
	templateUrl: './single-camera-view.component.html',
	styleUrls: ['./single-camera-view.component.scss']
})
export class SingleCameraViewComponent {
	camera?: Camera;
	view: string = "";

	constructor(
		private cameraService: CameraService,
		private route: ActivatedRoute
	) {
		route.paramMap.subscribe(params => {
			let cameraId = params.get("id") ?? "";
			if(
				!this.camera
				|| this.camera.id !== cameraId
			) {
				this.cameraService.getCamera(cameraId).subscribe((data: Camera) => {
					this.camera = data;
				});
			}
			this.view = params.get("camView") ?? "live";
		});
	}
}
