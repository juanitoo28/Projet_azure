import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeImagesComponent } from './liste-images.component';

describe('ListeImagesComponent', () => {
  let component: ListeImagesComponent;
  let fixture: ComponentFixture<ListeImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeImagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
