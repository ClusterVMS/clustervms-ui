import { Url } from 'url';

import { StreamMap } from './stream';



export type CameraId = string;

export interface Camera {
	id: CameraId;
	name: string;
	onvif_url: Url | null;
	username: string | null;
	password: string | null;
	streams: StreamMap;
}
