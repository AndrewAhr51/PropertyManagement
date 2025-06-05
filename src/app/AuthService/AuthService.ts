import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasValidSession());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private router: Router) {}

  // Check if a valid session exists
  private hasValidSession(): boolean {
    return !!localStorage.getItem('userToken');
  }

  login(token: string, userData: any) {
    // Save session data
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update login state
    this.loggedIn.next(true);

    // Redirect to home after login
    this.router.navigate(['/home']).catch((err) => console.error('Navigation error:', err));
  }

  logout() {
    // Clear user session data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');

    // Update login state
    this.loggedIn.next(false);

    // Redirect to login after logout
    setTimeout(() => {
      this.router.navigate(['/login']).catch((err) => console.error('Navigation error:', err));
    }, 0);
  }
}
