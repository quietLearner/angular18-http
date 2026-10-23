import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, map, from, of, throwError, finalize } from 'rxjs';

import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  // private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  ngOnInit() {
    this.isFetching.set(true);
    // initially, it's undefined
    console.log('lol', this.places());

    this.placesService
      .loadAvailablePlaces()
      .pipe(
        finalize(() => {
          this.isFetching.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (val) => {
          console.log(val);
          this.places.set(val);
        },
        error: (error) => {
          console.log(error);
          this.error.set(error);
        },
      });
  }

  onSelectPlace(place: Place) {
    this.placesService
      .addPlaceToUserPlaces(place)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
