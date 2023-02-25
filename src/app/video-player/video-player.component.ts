import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';

import Hls from 'hls.js';

import { Camera } from '../camera';
import { CameraService } from '../camera.service';
import { Recording } from '../recording';
import { StreamId, StreamMap } from '../stream';



/**
 * Component to play a video stream.
 * Based on webrtc portion of https://github.com/deepch/RTSPtoWeb/blob/master/web/templates/play_all.tmpl
 */
@Component({
	selector: 'app-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	host: {
		'(window:resize)': 'onResized($event)'
	}
})
export class VideoPlayerComponent implements AfterViewInit {

	@Input() cameraId: string = "";
	@Input() live: boolean = true;

	video: any;
	aspectRatio = 16 / 9;
	streamUrl: string = "";
	streamId: string = "";

	@ViewChild('video') videoDirective? : any;

	hlsFirstSegmentLoaded: boolean = false;
	hlsSegmentRetryCount: number = 0;

	webrtc: any;
	webrtcSendChannel: any;
	webrtcSendChannelInterval: any;

	constructor(private http: HttpClient, private cameraService: CameraService, private el: ElementRef) {}

	ngAfterViewInit(): void {
		if(this.cameraId == undefined) {
			console.log("cameraId is undefined");
			return;
		}
		if(this.videoDirective == undefined) {
			console.log("video element is undefined");
			return;
		}
		/// FIXME: error checking
		console.log(document.getElementsByTagName("video"));
		console.log(this.videoDirective.nativeElement);
		this.updatePlayer();
	}

	onResized(event: any) {
		this.updatePlayer();
	}

	updatePlayer(): void {
		if(this.live) {
			this.playWebrtc();
		} else {
			this.playRecordingUrl();
		}
	}

	/// Determines the optimal stream to play, based on size and other characteristics
	chooseStream(streams: StreamMap): StreamId {
		let playerWidth = this.videoDirective.nativeElement.offsetWidth;

		let bestStreamId = "";
		for(let [streamId, streamInfo] of Object.entries(streams)) {
			// Choose this stream if we haven't chosen any yet.
			if(bestStreamId === "") {
				bestStreamId = streamId;
				continue;
			}

			let bestStreamScore = this.scoreStream(playerWidth, streams[bestStreamId].width);
			let thisStreamScore = this.scoreStream(playerWidth, streamInfo.width);
			if(thisStreamScore > bestStreamScore) {
				bestStreamId = streamId;
				continue;
			}
		}

		return bestStreamId;
	}

	/// Returns a score for the suitability of the given stream
	/// Tries to find a stream close to the size of the player, favoring too-large streams vs too-small streams
	scoreStream(playerWidth: number, streamWidth: number): number {
		if(playerWidth > streamWidth) {
			// Stream is smaller than the player
			return -1.0 * Math.abs(playerWidth - streamWidth);
		} else {
			// Stream is larger than the player
			return -0.25 * Math.abs(playerWidth - streamWidth);
		}
	}

	playRecordingUrl() {
		this.cameraService.getCamera(this.cameraId).subscribe((data: Camera) => {
			if(data == undefined) {
				return;
			} else {
				let newStreamId = this.chooseStream(data.streams);
				if(newStreamId === this.streamId) {
					// Current stream is still the appropriate one.
					return;
				}
				this.streamId = newStreamId;
				console.log("Chose stream " + this.streamId + " for camera " + this.cameraId);

				this.cameraService.getRecordings(this.cameraId, this.streamId).subscribe((recordings: Recording[]) => {
					if(recordings.length == 0) {
						console.error("No recordings found for camera " + this.cameraId + " stream " + this.streamId);
						return;
					}
					this.streamUrl = recordings[0].url;
					if(this.streamUrl === "") {
						console.error("Failed to retrieve recording URL for camera " + this.cameraId + " stream " + this.streamId);
						return;
					}

					this.video = this.videoDirective.nativeElement;
					this.video.src = this.streamUrl;
				});
			}
		});
	}

	/// Deprecated; no longer using HLS, but keeping this here for now in case we bring it back.
	playHls() {
		this.cameraService.getCamera(this.cameraId).subscribe((data: Camera) => {
			if(data == undefined) {
				return;
			} else {
				let newStreamId = this.chooseStream(data.streams);
				if(newStreamId === this.streamId) {
					// Current stream is still the appropriate one.
					return;
				}
				this.streamId = newStreamId;
				console.log("Chose stream " + this.streamId + " for camera " + this.cameraId);

				this.streamUrl = "http://clustervms.localdomain/v0/recordings/"+this.cameraId+"/"+this.streamId+"/combined.m3u8";
				if(this.streamUrl === "") {
					console.error("Failed to retrieve combined recording URL for camera " + this.cameraId + " stream " + this.streamId);
					return;
				}

				this.video = this.videoDirective.nativeElement;
				if (Hls.isSupported()) {
					var hls = new Hls();
					hls.loadSource(this.streamUrl);
					hls.attachMedia(this.video);

					hls.on(Hls.Events.FRAG_LOADED, () => {
						this.hlsFirstSegmentLoaded = true;
						this.hlsSegmentRetryCount = 0;
					});

					hls.on(Hls.Events.ERROR, (event, data) => {
						console.warn("HLS error: ", data);

						if(data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
							// A fragment couldn't load, even after retrying it a few times.
							// Move on to another fragment
							console.error("HLS segment ", data.frag?.relurl, " failed to load; moving on");

							this.hlsSegmentRetryCount++;

							// If this isn't the first time the segment failed to load, skip past it until we find a segment we can load.
							if(this.hlsSegmentRetryCount > 1) {
								if(data.frag) {
									// Reload at the start of the next fragment
									let retryPosition = data.frag.start + data.frag.duration + 0.1;
									console.log("attempting to reload at ", retryPosition);
									hls.stopLoad();
									hls.startLoad(retryPosition);
									// Set video time to the new position
									// Without this, Hls.js will keep trying to load the same segment again even though we changed the startPosition.
									this.video.currentTime = retryPosition;
								} else {
									console.error("HLS error object did not contain 'frag' field. Unable to determine position to retry at.");
								}
							}
						}

						if(data.fatal) {
							switch(data.type) {
								case Hls.ErrorTypes.NETWORK_ERROR:
									console.warn("Fatal network error; trying to recover");
									hls.startLoad();
									break;
								case Hls.ErrorTypes.MEDIA_ERROR:
									console.warn("Fatal media error; trying to recover");
									hls.recoverMediaError();
									break;
								default:
									// Cannot recover
									console.error("Fatal HLS error; cannot recover");
									hls.destroy();
									// Try re-creating from the beginning
									this.playHls();
									break;
							}
						}
					});
				} else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
					// Native browser support available
					this.video.src = this.streamUrl;
				}
			}
		});
	}

	playWebrtc() {
		this.webrtc = null;
		this.webrtcSendChannel = null;
		this.webrtcSendChannelInterval = null;
		this.video = this.videoDirective.nativeElement;

		this.cameraService.getCamera(this.cameraId).subscribe((data: Camera) => {
			if(data == undefined) {
				return;
			} else {
				let newStreamId = this.chooseStream(data.streams);
				if(newStreamId === this.streamId) {
					// Current stream is still the appropriate one.
					return;
				}
				this.streamId = newStreamId;
				console.log("Chose stream " + this.streamId + " for camera " + this.cameraId);

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
				// Clear streamId to indicate we're no longer playing any stream.
				this.streamId = "";
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
