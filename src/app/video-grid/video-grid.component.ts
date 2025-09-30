import { Component, ElementRef, ViewChild } from '@angular/core';

import { Camera } from '../camera';
import { CameraService } from '../camera.service';

@Component({
	selector: 'app-video-grid',
	templateUrl: './video-grid.component.html',
	styleUrls: ['./video-grid.component.scss'],
	host: {
		'(window:resize)': 'onResized($event)'
	},
	standalone: false,
})
export class VideoGridComponent {
	cameras: Camera[] = [];

	videoColumns = 1;

	@ViewChild('videoGrid') videoGridElement!: ElementRef;

	constructor(private cameraService: CameraService) {}

	ngOnInit(): void {
		this.getCameras();
	}

	onResized(event: any) {
		this.updateGrid();
	}

	/// Updates the number of rows and columns to best fit the videos
	updateGrid(): void {
		let element = this.videoGridElement.nativeElement;
		let gridAspectRatio = element.offsetParent.clientWidth / element.offsetParent.clientHeight;
		let videoAspectRatio = 16 / 9;
		let numVideos = this.cameras.length;

		// Find how many rows it takes before we're forced to scale down the players to avoid overflowing the height.
		for(let numRows = 1; numRows <= numVideos; ++numRows) {
			// working in relative dimensions; grid height is 1, grid width is gridAspectRatio
			let gridWidth = gridAspectRatio;
			let gridHeight = 1;
			let gridArea = gridWidth * gridHeight;
			let numColumns = Math.ceil(numVideos / numRows);

			let columnWidth = gridWidth / numColumns;
			let rowHeight = columnWidth / videoAspectRatio;
			let contentHeight = numRows * rowHeight;

			if(contentHeight > gridHeight) {
				// Vertical overflow!
				// This should be the ideal number of columns if filling the height of the grid
				// If filling the width of the grid, we want one less row

				if(numRows === 1) {
					// One row is the minimum we can do, so we'll go with that
					this.videoColumns = numColumns;
					return;
				}

				// Calculate fill proportion if filling the height of the grid
				let playerHeight = gridHeight / numRows;
				let playerWidth = playerHeight * videoAspectRatio;
				let fillHeightPlayerArea = playerWidth * playerHeight;
				let fillHeightFillProportion = (numVideos * fillHeightPlayerArea) / gridArea;

				// Figure out the fill proportion if we used one less row and filled the width of the grid
				let fillWidthNumRows = numRows - 1;
				let fillWidthNumColumns = Math.ceil(numVideos / fillWidthNumRows);
				playerWidth = gridWidth / fillWidthNumColumns;
				playerHeight = playerWidth / videoAspectRatio;
				let fillWidthPlayerArea = playerWidth * playerHeight;
				let fillWidthFillProportion = (numVideos * fillWidthPlayerArea) / gridArea;

				if (fillHeightFillProportion > fillWidthFillProportion) {
					this.videoColumns = numColumns;
				} else {
					this.videoColumns = fillWidthNumColumns;
				}
				return;
			}
		}

		// Never found a number of rows that would cause vertical overflow
		// This means we can put everything into one column, expand to fill the width, and still have extra vertical space.
		this.videoColumns = 1;
	}

	getCameras(): void {
		this.cameraService.getCameras().subscribe(cameras => {
			console.log(cameras);
			this.cameras = cameras;
			this.updateGrid();
		});
	}
}
