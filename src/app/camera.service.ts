import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Camera } from './camera';



@Injectable({
	providedIn: 'root'
})
export class CameraService {

	constructor(private http: HttpClient) {}

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
