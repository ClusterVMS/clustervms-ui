import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';



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

	@Input() cameraId?: number;

	webrtc: any;
	webrtcSendChannel: any;
	webrtcSendChannelInterval: any;
	video: any;
	streamUrl: string = "";
	streamId: number = 0;

	@ViewChild('video') videoDirective? : any;
	constructor(private http: HttpClient) {}

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

	playWebrtc() {
		this.webrtc = null;
		this.webrtcSendChannel = null;
		this.webrtcSendChannelInterval = null;
		this.video = this.videoDirective.nativeElement;

		this.http.get("http://clustervms.localdomain/v0/cameras/"+this.cameraId).subscribe((data: any) => {
			this.streamUrl = data.streams[this.streamId].recast_url;

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
			this.webrtcSendChannel.onclose = (e: any) => console.log('sendChannel has closed', e);
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
