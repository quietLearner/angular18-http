import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Injectable,
  computed,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  catchError,
  EMPTY,
  map,
  from,
  of,
  throwError,
  finalize,
  Observable,
  tap,
} from 'rxjs';

import { Place } from './place.model';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]); //Stores a reactive value. When that value changes, Angular knows about it.

  readonly loadedUserPlaces = this.userPlaces.asReadonly();

  //You use computed() when you want to calculate or transform a value based on another Signal.
  readonly totalPlaces = computed(() => this.userPlaces().length);

  // You technically could write:
  // readonly loadedUserPlaces = computed(() => this.userPlaces());
  // That would work and remain reactive, but it adds an unnecessary computed layer because you're not transforming anything.

  loadAvailablePlaces(): Observable<Place[]> {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching the available places.',
    );
  }

  loadUserPlaces(): Observable<Place[]> {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places.',
    ).pipe(tap((places) => this.userPlaces.set(places)));
    //tap() performs side effects without changing emitted values.
  }

  addPlaceToUserPlaces(place: Place) {
    return this.httpClient
      .put<{ userPlaces: Place[] }>('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        tap((response) => this.userPlaces.set(response.userPlaces)),
        catchError(() => {
          this.errorService.showError(
            'Could not add this place. Please try again.',
          );
          return EMPTY;
        }),
      );
  }

  removeUserPlace(place: Place): Observable<void> {
    return this.httpClient
      .delete<void>(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        tap(() => {
          this.userPlaces.update((currentPlaces) =>
            currentPlaces.filter((p) => p.id !== place.id),
          );
        }),
        catchError(() => {
          this.errorService.showError(
            'Could not remove this place. Please try again.',
          );
          return EMPTY;
        }),
      );
  }

  private fetchPlaces(url: string, errorMessage: string): Observable<Place[]> {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((response) => response.places),
      catchError((error) => throwError(() => new Error(errorMessage))),
      finalize(() => {
        // Cleanup logic
      }),
    );
  }
}
