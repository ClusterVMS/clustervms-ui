


export type StreamId = string;

export type StreamMap = {
	[key: StreamId]: Stream;
};

export interface Stream {
	id: StreamId;
	source_url: string;
	recast_url?: string;
}
