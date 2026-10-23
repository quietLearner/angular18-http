import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, map, from, of, throwError, finalize } from 'rxjs';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';

import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  // places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  // A: Reactive,
  // Assigns the Signal itself. places is a function-like reactive Signal, so calling places() reads its latest value.
  places = this.placesService.loadedUserPlaces;

  // B: Snapshot
  // Calls the Signal immediately and stores the returned Place[] array. That property does not automatically receive a new array when the Signal changes.
  places2 = this.placesService.loadedUserPlaces();

  ngOnInit() {
    this.isFetching.set(true);
    // initially, it's undefined
    console.log('lol', this.places());

    this.placesService
      .loadUserPlaces()
      .pipe(
        finalize(() => {
          this.isFetching.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        // next: (reponse) => this.places.set(reponse),
        error: (error) => {
          console.log(error);
          this.error.set(error);
        },
      });
  }

  onRemovePlace(place: Place) {
    this.placesService
      .removeUserPlace(place)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
