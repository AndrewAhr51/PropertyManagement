import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
// ✅ Ensure RouterModule is available

interface IProperty {
  property_id: number;
  name: string;
  type: string;
  address: string;
  address1?: string;
  city: string;
  state: string;
  zipcode: string;
  sq_ft: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  rent_price?: number;
  purchase_price?: number;
  owner_id: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  created_at: Date;
  updated_at?: Date;
}

@Component({
  selector: 'app-properties',
  standalone: true, // ✅ If using standalone components
  imports: [CommonModule, RouterModule], // ✅ RouterModule for routerLink support
  templateUrl: './property.html',
  styleUrls: ['./property.css']
})

export class PropertyComponent { // ✅ Renamed for clarity
 public property: IProperty = {
  property_id: 1,
  name: 'Sunset Villa',
  type: 'Apartment',
  address: '123 Main St',
  city: 'Phoenix',
  state: 'AZ',
  zipcode: '85001',
  sq_ft: 1200,
  bedrooms: 2,
  bathrooms: 2,
  year_built: 2005,
  rent_price: 2000,
  purchase_price: 250000,
  owner_id: 101,
  status: 'Available',
  created_at: new Date(),
};

 constructor(private route: ActivatedRoute) {}
 ngOnInit() {
   const propertyId = this.route.snapshot.paramMap.get('id');
   console.log('Property ID:', propertyId);
 }
}
