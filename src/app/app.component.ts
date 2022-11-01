import { Component } from '@angular/core';

import { Camera } from './camera';
import { CameraService } from './camera.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'clustervms-ui';

	cameras: Camera[] = [];

	constructor(private cameraService: CameraService) {}

	ngOnInit(): void {
		this.getCameras();
	}

	getCameras(): void {
		this.cameraService.getCameras().subscribe(cameras => {
			console.log(cameras);
			this.cameras = cameras;
		});
	}
}
