import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TargetInterface } from '../../home.page';

@Component({
	selector: 'wt-target-form',
	templateUrl: './target-form.component.html',
	styleUrls: ['./target-form.component.scss'],
})
export class TargetFormComponent implements OnInit {
	//
	@Input() target?: TargetInterface;

	@Output() onSubmit = new EventEmitter<TargetInterface>();
	@Output() onDelete = new EventEmitter<void>();

	readonly DATE_FORMAT = environment.DATE_FORMAT;
	readonly AVAILABLE_YEARS = this.getYearValues();
	readonly TARGET_GROUP: FormGroup = new FormGroup({
		isFavorite: new FormControl(false),
		target: new FormControl(undefined, [
			Validators.required,
			Validators.min(0.01),
			Validators.max(99999),
			Validators.pattern(environment.DEMCIMAL_PATTERN),
		]),
		date: new FormControl(this.getDefaultDate(), [Validators.required]),
		walks: new FormControl([]),
	});

	ngOnInit(): void {
		if (this.target) {
			this.TARGET_GROUP.patchValue({ ...this.target });
		}
	}

	resetAddFrom(): void {
		this.TARGET_GROUP.reset({
			date: this.getDefaultDate(),
		});
	}

	deleteTarget(): void {
		this.onDelete.emit();
	}

	submit(): void {
		if (this.TARGET_GROUP.valid) {
			const value = this.TARGET_GROUP.value;
			value.walks = this.target?.walks || [];
			value.target = Number(value.target.toFixed(2));
			this.resetAddFrom();
			this.onSubmit.emit(value as TargetInterface);
		} else {
			this.TARGET_GROUP.markAllAsTouched();
		}
	}

	private getYearValues(): number[] {
		const min = 2010;
		const max = new Date().getFullYear() + 2;
		return Array.from({ length: max - min + 1 }, (_, i) => i + min);
	}

	private getDefaultDate(): string {
		return new Date().toISOString().substring(0, 7);
	}
}
