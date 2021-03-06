import { Component, ViewChild } from '@angular/core';
import { AlertController, IonSegment } from '@ionic/angular';
import { environment } from 'src/environments/environment';

export interface WalkInterface {
	isDone: boolean;
	planned: number;
	walked?: number;
	date: string;
}

export interface TargetInterface {
	isFavorite: boolean;
	target: number;
	date: string;
	walks: WalkInterface[];
}

@Component({
	selector: 'wt-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage {
	//
	@ViewChild('segment') segmentBtns?: IonSegment;

	readonly DATE_FORMAT = environment.DATE_FORMAT;
	readonly DAY_FORMAT = environment.DAY_FORMAT;

	targets: TargetInterface[] = JSON.parse(localStorage.getItem('targets') || '[]');
	filteredTargets: TargetInterface[] = this.targets;
	selectedTarget?: TargetInterface;

	constructor(private alertCtr: AlertController) {}

	setFilteredTargets(): void {
		this.selectedTarget = undefined;
		if (this.segmentBtns?.value === 'favorites') {
			this.filteredTargets = this.targets.filter(t => t.isFavorite);
		} else if (this.segmentBtns?.value === 'all') {
			this.filteredTargets = [...this.targets];
		}
	}

	changeSelected(increment: number): void {
		if (!this.selectedTarget) {
			return;
		}

		const index = this.filteredTargets.indexOf(this.selectedTarget) + increment;
		if (index >= this.filteredTargets.length) {
			this.selectedTarget = this.filteredTargets[0];
		} else if (index < 0) {
			this.selectedTarget = this.filteredTargets[this.targets.length - 1];
		} else {
			this.selectedTarget = this.filteredTargets[index];
		}
	}

	isFavDisabled(): boolean {
		return !this.targets.find(t => t.isFavorite);
	}

	deleteTarget(value: TargetInterface): void {
		this.showAlert(() => {
			const index = this.targets.indexOf(value);
			if (index > -1) {
				this.targets.splice(index, 1);
				this.sortAndSaveTargets();
				this.setFilteredTargets();
			} else {
				console.error('Not found for deletion:', value);
			}
		});
	}

	addTarget(value: TargetInterface): void {
		this.targets.push(value);
		this.sortAndSaveTargets();
		this.setFilteredTargets();
	}

	changeTarget(newValue: TargetInterface): void {
		if (!this.selectedTarget) {
			return;
		}

		this.targets[this.targets.indexOf(this.selectedTarget)] = newValue;
		this.selectedTarget = newValue;
		this.sortAndSaveTargets();
	}

	deleteWalk(value: WalkInterface, force?: boolean): void {
		if (!this.selectedTarget) {
			return;
		}

		if (force) {
			const index = this.selectedTarget.walks.indexOf(value);
			if (index > -1) {
				this.selectedTarget.walks.splice(index, 1);
				this.sortAndSaveTargets();
			} else {
				console.error('Not found for deletion:', value);
			}
		} else {
			this.showAlert(() => this.deleteWalk(value, true));
		}
	}

	addWalk(value: WalkInterface): void {
		if (!this.selectedTarget) {
			return;
		}

		this.selectedTarget.walks.push(value);
		this.sortAndSaveTargets();
	}

	editWalk(oldValue: WalkInterface, newValue: WalkInterface): void {
		this.deleteWalk(oldValue, true);
		this.addWalk(newValue);
	}

	getColorForWalk(walk: WalkInterface): string {
		const date = new Date();
		// eslint-disable-next-line max-len
		const walkDate = new Date(Number(walk.date.substring(0, 4)), Number(walk.date.substring(5, 7)) - 1, Number(walk.date.substring(8, 10)));
		const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		return walk.isDone
			? (walk.walked ?? 0) < walk.planned
				? 'warning'
				: 'success'
			: walkDate.getTime() === currentDate.getTime()
			? 'warning'
			: walkDate <= currentDate
			? 'danger'
			: '';
	}

	getWalkedKm(value: TargetInterface): number {
		return Number(value.walks.reduce((prev, cur) => prev + (cur.walked ?? 0), 0).toFixed(2));
	}

	getAvarageKm(value: TargetInterface): number {
		return Number((this.getWalkedKm(value) / new Date().getDate()).toFixed(2));
	}

	getDaysInMonth(): number {
		const date = new Date();
		return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
	}

	getLabel(value: TargetInterface): string {
		return this.getWalkedKm(value) + ' / ' + value.target + 'Km';
	}

	sortAndSaveTargets(): void {
		this.targets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		this.targets.forEach(t => {
			t.walks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		});
		localStorage.setItem('targets', JSON.stringify(this.targets));
	}

	getHighlightedDays(target: TargetInterface): number[] {
		return target.walks.map(w => new Date(w.date).getDate());
	}

	private showAlert(confirm: () => void): void {
		this.alertCtr
			.create({
				header: 'Sind sie sich sicher?',
				cssClass: 'confirm-alert',
				buttons: [
					{
						text: 'Ja',
						role: 'confirm',
						cssClass: 'alert-button-confirm',
						handler: confirm,
					},
					{
						text: 'Nein',
						role: 'cancel',
						cssClass: 'alert-button-cancel',
					},
				],
			})
			.then(alert => alert.present());
	}
}
