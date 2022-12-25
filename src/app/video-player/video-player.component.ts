import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';

import { Camera } from '../camera';
import { CameraService } from '../camera.service';
import { StreamId, StreamMap } from '../stream';



/**
 * Component to play a video stream.
 * Based on webrtc portion of https://github.com/deepch/RTSPtoWeb/blob/master/web/templates/play_all.tmpl
 */
@Component({
	selector: 'app-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements AfterViewInit {

	@Input() cameraId: string = "";

	webrtc: any;
	webrtcSendChannel: any;
	webrtcSendChannelInterval: any;
	video: any;
	aspectRatio = 16 / 9;
	streamUrl: string = "";
	streamId: string = "";

	@ViewChild('video') videoDirective? : any;

	constructor(private http: HttpClient, private cameraService: CameraService, private el: ElementRef) {}

	ngAfterViewInit(): void {
		if(this.cameraId === undefined) {
			console.log("cameraId is undefined");
			return;
		}
		if(this.videoDirective === undefined) {
			console.log("video element is undefined");
			return;
		}
		/// FIXME: error checking
		console.log(document.getElementsByTagName("video"));
		console.log(this.videoDirective.nativeElement);
		this.playWebrtc()
	}

	/// Determines the optimal stream to play, based on size and other characteristics
	chooseStream(streams: StreamMap): StreamId {
		let playerWidth = this.el.nativeElement.offsetWidth;

		let bestStreamId = "";
		for(let [streamId, streamInfo] of Object.entries(streams)) {
			// Choose this stream if we haven't chosen any yet.
			if(bestStreamId === "") {
				bestStreamId = streamId;
				continue;
			}

			// Choose the stream that's closest in size to our player
			// Not sure what formula makes the most sense. Using simple difference for now, but there might be a better formula.
			if(Math.abs(playerWidth - streams[bestStreamId].width) > Math.abs(playerWidth - streamInfo.width)) {
				bestStreamId = streamId;
				continue;
			}
		}

		return bestStreamId;
	}

	playWebrtc() {
		this.webrtc = null;
		this.webrtcSendChannel = null;
		this.webrtcSendChannelInterval = null;
		this.video = this.videoDirective.nativeElement;

		this.cameraService.getCamera(this.cameraId).subscribe((data: Camera) => {
			if(data === undefined) {
				return;
			} else {
				this.streamId = this.chooseStream(data.streams);
				this.streamUrl = data.streams[this.streamId]?.recast_url ?? "";
				if(this.streamUrl === "") {
					console.error("Failed to retrieve URL for camera " + this.cameraId + " stream " + this.streamId);
					return;
				}
			}

			var _this = this;
			this.webrtc = new RTCPeerConnection({
				iceServers: [
					{
						urls: ["stun:stun.freeswitch.org:3478"]
					},
				],
			});
			this.webrtc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
			this.webrtc.ontrack = function(event: any) {
				console.log(event.streams.length + ' track is delivered');
				_this.video.srcObject = event.streams[0];
				_this.video.play();
			}
			this.webrtc.addTransceiver('video', {
				'direction': 'recvonly'
			});
			this.webrtcSendChannel = this.webrtc.createDataChannel('foo');
			this.webrtcSendChannel.onclose = (e: any) => {
				console.log('sendChannel has closed', e);
				// Attempt to reconnect
				// TODO: if connection fails, should periodically re-try
				this.playWebrtc();
			};
			this.webrtcSendChannel.onopen = () => {
				console.log('sendChannel has opened');
				this.webrtcSendChannel.send('ping');
				this.webrtcSendChannelInterval = setInterval(() => {
					this.webrtcSendChannel.send('ping');
				}, 1000)
			}

			this.webrtcSendChannel.onmessage = (e: any) => console.log(e.data);
		});
	}

	async handleNegotiationNeeded() {
		var _this = this;
		var offer: any;

		offer = await _this.webrtc.createOffer();
		await _this.webrtc.setLocalDescription(offer);

		this.http.post(this.streamUrl,
			_this.webrtc.localDescription.sdp,
			{
				headers: new HttpHeaders({
					'Accept': '*/*',
					'Content-Type': "text/plain; charset=UTF-8"
				}),
				responseType: 'text'
			}
		).subscribe((data: any) => {
			try {
				_this.webrtc.setRemoteDescription({
					type: 'answer',
					sdp: data
				})
			} catch (e) {
				console.warn(e);
			}
		});
	}

	destroy() {
		clearInterval(this.webrtcSendChannelInterval);
		this.webrtc.close();
		this.video.srcObject = null;
	}

}
