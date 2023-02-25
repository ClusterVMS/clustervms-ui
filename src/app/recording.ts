import { CameraId } from './camera';
import { StreamId } from './stream';



export interface Recording {
	camera: CameraId;
	stream: StreamId;
	url: string;
}
