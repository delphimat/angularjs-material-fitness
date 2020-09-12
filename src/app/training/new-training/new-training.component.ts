import { Component, OnInit } from '@angular/core';
import {TrainingService} from "../training.service";
import {Exercise} from "../exercise.model";
import { map  } from 'rxjs/operators';
import {NgForm} from "@angular/forms";
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from "rxjs";

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {

  exercices: Observable<Exercise[]>;

  constructor(
    private trainingService: TrainingService,
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.exercices = this.db
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(map(docArray => {
          return docArray.map( doc => {
            return {
              id: doc.payload.doc.id,
              name: doc.payload.doc.data().name,
              duration: doc.payload.doc.data().duration,
              calories: doc.payload.doc.data().calories,
            }
          })
      }))
    ;
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
