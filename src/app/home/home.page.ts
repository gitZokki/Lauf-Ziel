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
				this.setFilteredTargets();
				this.selectedTarget = this.filteredTargets[Math.max(0, index - 1)];
				this.sortAndSaveTargets();
			} else {
				console.error('Not found for deletion:', value);
			}
		});
	}

	addTarget(value: TargetInterface): void {
		this.targets.push(value);
		this.sortAndSaveTargets();
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

	getWalkedKm(value: TargetInterface): number {
		return Number(value.walks.reduce((prev, cur) => prev + (cur.walked ?? 0), 0).toFixed(2));
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

	private showAlert(confirm: () => void): void {
		this.alertCtr
			.create({
				header: 'Sind sie sich sicher?',
				cssClass: 'confirm-alert',
				buttons: [
					{
						text: 'Ja',
						cssClass: 'alert-button-confirm',
						handler: confirm,
					},
					{
						text: 'Nein',
						cssClass: 'alert-button-cancel',
					},
				],
			})
			.then(alert => alert.present());
	}
}
