import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Camera, CameraId } from './camera';



@Injectable({
	providedIn: 'root'
})
export class CameraService {

	constructor(private http: HttpClient) {}

	getCamera(id: CameraId): Observable<Camera> {
		if(id === "") {
			console.warn("Empty string handed to getCamera()");
			return new Observable(observer => {
				observer.next(undefined);
			});
		}
		return this.http.get<Camera>("http://clustervms.localdomain/v0/cameras/"+id)
			.pipe(
				tap(_ => console.log("fetched camera")),
				catchError(this.handleError<Camera>('getCamera', undefined))
			);
	}

	getCameras(): Observable<Camera[]> {
		return this.http.get<Camera[]>("http://clustervms.localdomain/v0/cameras/")
			.pipe(
				tap(_ => console.log("fetched cameras")),
				catchError(this.handleError<Camera[]>('getCameras', []))
			);
	}

	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
	
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// TODO: better job of transforming error for user consumption
			console.log(`${operation} failed: ${error.message}`);

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}
}
