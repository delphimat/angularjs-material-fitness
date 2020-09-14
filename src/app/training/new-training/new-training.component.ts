import {Component, OnDestroy, OnInit} from '@angular/core';
import {TrainingService} from "../training.service";
import {Exercise} from "../exercise.model";
import { map  } from 'rxjs/operators';
import {NgForm} from "@angular/forms";
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, Subscription } from "rxjs";
import { UiService } from "../../shared/ui.service";

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy  {

  exercises: Exercise[];
  exerciseSubcription: Subscription;
  isLoading = false;
  private loadingSubs : Subscription;

  constructor(
    private trainingService: TrainingService,
    private uiService: UiService
  ) { }

  ngOnInit(): void {
    this.exerciseSubcription = this.trainingService.exercisesChanged.subscribe(
      exercises => (this.exercises = exercises)
    );
    this.loadingSubs = this.uiService.loadingStateChanged.subscribe(isLoading => {
      this.isLoading = isLoading;
    })
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  ngOnDestroy() {
    this.exerciseSubcription.unsubscribe();
    this.loadingSubs.unsubscribe();
  }

}
