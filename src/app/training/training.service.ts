import { Subject } from "rxjs";

import {Exercise} from "./exercise.model";
import {map} from "rxjs/operators";
import {AngularFirestore} from "angularfire2/firestore";
import {Injectable} from "@angular/core";

@Injectable()
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();

  private availableExercices: Exercise[] = [];
  private runningExercise: Exercise;
  private completedExercises: Exercise[] = [];

  constructor(private db: AngularFirestore) {

  }

  public fetchAvailableExercises() {
    this.db
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(map(docArray => {
        return docArray.map( doc => {
          return {
            id:  doc.payload.doc.id,
            name: doc.payload.doc.data().name,
            duration: doc.payload.doc.data().duration,
            calories: doc.payload.doc.data().calories,
          }
        })
      }))
      .subscribe((exercises: Exercise[]) => {
        console.log(exercises);
          this.availableExercices = exercises;
          this.exercisesChanged.next([...this.availableExercices]);
      })
      ;
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercices.find(
      ex => ex.id === selectedId
    );

    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.completedExercises.push(
      {...this.runningExercise,
        date: new Date(),
        state: 'completed'
      });

    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.completedExercises.push({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.duration * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });

    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return {...this.runningExercise } ;
  }

  public getCompletedExercises() {
    return this.completedExercises.slice();
  }
}
