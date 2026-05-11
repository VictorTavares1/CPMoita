import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (environment.production) {
  console.error = () => {};
}

bootstrapApplication(App, appConfig).catch((err) => { if (!environment.production) console.error(err); });
