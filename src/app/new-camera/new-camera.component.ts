import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { Camera } from '../camera';
import { CameraService } from '../camera.service';
import { Stream, StreamMap } from '../stream';

@Component({
	selector: 'app-new-camera',
	templateUrl: './new-camera.component.html',
	styleUrls: ['./new-camera.component.scss']
})
export class NewCameraComponent {
	cameraForm = this.fb.group({
		name: [""],
		username: [""],
		password: [""],
		onvif_url: [""],
		streams: this.fb.array([])
	})

	get streams() {
		return this.cameraForm.get("streams") as FormArray;
	}

	constructor(private fb: FormBuilder, private cameraService: CameraService, private router: Router) {
		// Add an initial, blank stream
		this.addStream();
	}

	addStream() {
		this.streams.push(this.fb.group({
			id: [""],
			source_url: [""],
		}))
	}

	removeStream(index: number) {
		this.streams.removeAt(index);
	}

	onSubmit() {
		let streamMap = {} as StreamMap;
		this.streams.controls.forEach(control => {
			let stream = control.value as Stream;
			streamMap[stream.id] = stream;
		});

		let camera = {
			id: "", // Camera Manager will assign an appropriate ID
			name: this.cameraForm.value.name,
			onvif_url: this.cameraForm.value.onvif_url,
			username: this.cameraForm.value.username,
			password: this.cameraForm.value.password,
			streams: streamMap,
		} as Camera;

		this.cameraService.addCamera(camera).subscribe(camera => {
			this.router.navigate(["/cameras/", camera.id]);
		})
	}
}
