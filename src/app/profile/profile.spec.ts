import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileTsComponent } from './profile-ts.component';

describe('ProfileTsComponent', () => {
  let component: ProfileTsComponent;
  let fixture: ComponentFixture<ProfileTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileTsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
