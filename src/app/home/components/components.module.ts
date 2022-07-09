import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TargetFormComponent } from './target-form/target-form.component';
import { WalkFormComponent } from './walk-form/walk-form.component';

const PAGES = [
	TargetFormComponent, //
	WalkFormComponent,
];

@NgModule({
	declarations: PAGES,
	exports: PAGES,
	imports: [
		CommonModule, //
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
	],
})
export class ComponentsModule {}
