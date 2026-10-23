import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import {
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { tap } from 'rxjs';

//provideHttpClient registers the HttpClient service with Angular's Dependency Injection (DI) system.
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      //add interceptor
      withInterceptors([loggingInterceptor]),
    ),
  ],
}).catch((err) => console.error(err));

// bootstrapApplication(AppComponent, ...) starts your standalone Angular application using AppComponent as the root component.

// providers: [provideHttpClient()] configures Angular's application-level dependency injector so that HttpClient can be injected into services and components.

function loggingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  // const req = request.clone({
  //   headers: request.headers.set('X-NAME', 'ZY'),
  // });
  // console.log('[outgoing request]', req);
  // return next(req);
  console.log('[outgoing request]', request);
  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('[incoming response]', event.status, event.body);
        }
      },
    }),
  );
}
