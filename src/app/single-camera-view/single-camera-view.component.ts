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

	constructor(
		private cameraService: CameraService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.getCamera();
	}

	getCamera(): void {
		let cameraId = this.route.snapshot.paramMap.get("id") ?? "";
		this.cameraService.getCamera(cameraId).subscribe((data: Camera) => {
			this.camera = data;
		});
	}
}
