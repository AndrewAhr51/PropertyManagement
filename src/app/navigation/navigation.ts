import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './../AuthService/AuthService';

@Component({
  selector: 'app-navigation',
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css']
})
export class Navigation implements OnInit {
  isDarkMode = signal(false);
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to login state dynamically
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Retrieve dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode.set(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);
  }

  logout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    this.isDarkMode.update(prev => !prev);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
    localStorage.setItem('darkMode', this.isDarkMode().toString());
  }
}
