import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Adiciona withCredentials a todas as chamadas para a nossa API.
 * Necessário para que o browser envie o cookie HttpOnly admin_token.
 * Chamadas para outros domínios não são afectadas.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl)) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
