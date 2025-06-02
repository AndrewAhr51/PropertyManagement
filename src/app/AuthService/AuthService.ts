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

    // Ensure navigation execution
    setTimeout(() => {
      if (this.router) {
        this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
      }
    }, 0);
  }
}
