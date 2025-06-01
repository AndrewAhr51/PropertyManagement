import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Navigation } from './navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
isDarkMode = signal(false);

  // Load dark mode preference when the app starts
  ngOnInit() {
  const savedMode = localStorage.getItem('darkMode') === 'true';
  this.isDarkMode.set(savedMode);
  document.body.classList.toggle('dark-mode', savedMode);
}

  // Toggle dark mode and store the preference
  toggleDarkMode() {
    this.isDarkMode.update((prev) => !prev);
    document.body.classList.toggle('dark-mode', this.isDarkMode());

    localStorage.setItem('darkMode', this.isDarkMode().toString());

    // Debugging logs
    console.log('Dark Mode Set:', this.isDarkMode());
    console.log('Stored in Local Storage:', localStorage.getItem('darkMode'));
  }
  protected title = 'PropertyManagement';
}
