import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  logout() {
    // Clear user session data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');

    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
