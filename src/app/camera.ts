import { Stream } from './stream';


export interface Camera {
	id: number;
	name: string;
	streams: Stream[];
}
