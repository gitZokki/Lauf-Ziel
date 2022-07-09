import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { WalkInterface } from '../../home.page';

@Component({
	selector: 'wt-walk-form',
	templateUrl: './walk-form.component.html',
	styleUrls: ['./walk-form.component.scss'],
})
export class WalkFormComponent implements OnInit {
	//
	@Input() date!: string;
	@Input() walk?: WalkInterface;

	@Output() onSubmit = new EventEmitter<WalkInterface>();
	@Output() onDelete = new EventEmitter<void>();

	readonly DAY_FORMAT = environment.DAY_FORMAT;
	readonly AVAILABLE_YEARS = this.getYearValues();
	readonly WALK_GROUP: FormGroup = new FormGroup({
		isDone: new FormControl(false),
		planned: new FormControl(undefined, [
			Validators.required,
			Validators.min(0.01),
			Validators.max(99999),
			Validators.pattern(environment.DEMCIMAL_PATTERN),
		]),
		date: new FormControl(undefined, [Validators.required]),
	});

	month?: string;
	year?: string;

	ngOnInit(): void {
		this.resetAddFrom();
		if (this.walk) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			this.walk.isDone && this.addWalkedControll();
			this.WALK_GROUP.patchValue({ ...this.walk });
		}
	}

	changeIsDone(isChecked: boolean): void {
		if (isChecked) {
			this.addWalkedControll(!this.walk ? this.WALK_GROUP.get('planned')?.value : undefined);
		} else {
			this.WALK_GROUP.removeControl('walked');
		}
	}

	resetAddFrom(): void {
		this.WALK_GROUP.reset();
		this.setDate();
	}

	deleteWalk(): void {
		this.onDelete.emit();
	}

	submit(): void {
		if (this.WALK_GROUP.valid) {
			const value = this.WALK_GROUP.value;
			this.setDate();
			value.planned = Number(value.planned.toFixed(2));

			if (value.isDone) {
				value.walked = value.walked ?? value.planned;
				value.walked = Number(value.walked.toFixed(2));
			} else {
				value.walked = undefined;
			}

			this.onSubmit.emit(value as WalkInterface);
		} else {
			if (!this.WALK_GROUP.get('walked')?.valid) {
				(document.querySelector('[formControlName="walked"]')?.parentElement as any)?.click();
			}
			this.WALK_GROUP.markAllAsTouched();
		}
	}

	private getYearValues(): number[] {
		const min = 2010;
		const max = new Date().getFullYear() + 2;
		return Array.from({ length: max - min + 1 }, (_, i) => i + min);
	}

	private setDate(): void {
		if (this.date) {
			this.month = this.date.substring(5, 7);
			this.year = this.date.substring(0, 4);
			const currentDate = new Date();
			if (currentDate.getMonth() + 1 !== Number(this.month) || currentDate.getFullYear() !== Number(this.year)) {
				this.WALK_GROUP.patchValue({ date: new Date(this.date).toISOString() });
			} else {
				this.WALK_GROUP.patchValue({ date: currentDate.toISOString() });
			}
		}
	}

	private addWalkedControll(defaultValue?: number): void {
		this.WALK_GROUP.addControl(
			'walked',
			new FormControl(defaultValue, [
				Validators.required,
				Validators.min(0.01),
				Validators.max(99999),
				Validators.pattern(environment.DEMCIMAL_PATTERN),
			])
		);
	}
}
