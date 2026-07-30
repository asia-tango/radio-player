import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistPickerComponent } from './playlist-picker.component';

describe('PlaylistPickerComponent', () => {
  let component: PlaylistPickerComponent;
  let fixture: ComponentFixture<PlaylistPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
