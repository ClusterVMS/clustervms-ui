import { StreamMap } from './stream';



export type CameraId = string;

export interface Camera {
	id: CameraId;
	name: string;
	streams: StreamMap;
}
