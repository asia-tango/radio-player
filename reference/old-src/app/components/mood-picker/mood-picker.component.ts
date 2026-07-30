import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mood-picker',
  templateUrl: './mood-picker.component.html',
  styleUrls: ['./mood-picker.component.scss']
})
export class MoodPickerComponent {
  @Input() visible = true;
}
