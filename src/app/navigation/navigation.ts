import { AuthService } from './../AuthService/AuthService';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css'],
  providers: [AuthService]
})
export class Navigation implements OnInit {
  isDarkMode = signal(false);

  ngOnInit() {
    // Retrieve dark mode preference from local storage
    const savedMode = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode.set(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);

  }

   constructor(private AuthService: AuthService) {}

  logout() {
    this.AuthService.logout();
  }


 toggleDarkMode() {
  this.isDarkMode.update((prev) => !prev);
  document.body.classList.toggle('dark-mode', this.isDarkMode());
  localStorage.setItem('darkMode', this.isDarkMode().toString());

  console.log('Dark Mode Status:', this.isDarkMode());
  console.log('Stored in Local Storage:', localStorage.getItem('darkMode'));
}
}
