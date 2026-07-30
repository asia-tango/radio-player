import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { TAGS } from '../../data/tags';

export interface StationPickerData {
  selectedTag: string | null;
}

@Component({
  selector: 'app-station-picker',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './station-picker.component.html',
  styleUrl: './station-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationPickerComponent {
  private readonly dialogRef = inject(MatDialogRef<StationPickerComponent>);
  protected readonly data = inject<StationPickerData>(MAT_DIALOG_DATA);
  protected readonly tags = TAGS;

  protected label(tag: string): string {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  protected isSelected(tag: string): boolean {
    return this.data.selectedTag === tag;
  }

  protected chooseTag(tag: string): void {
    this.dialogRef.close(tag);
  }

  protected clearTag(): void {
    this.dialogRef.close(null);
  }
}
