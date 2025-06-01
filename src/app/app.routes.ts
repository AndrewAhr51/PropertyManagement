import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Properties } from './properties/properties';
import { Contact } from './contact/contact';
import { Admin } from './admin/admin';
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'properties', component: Properties },
  { path: 'contact', component: Contact },
  { path: 'admin', component: Admin },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {path: '', redirectTo: '/login', pathMatch:'full'} // Redirect any unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouting {}
