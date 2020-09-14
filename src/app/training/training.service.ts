import { Subject } from "rxjs";

import {Exercise} from "./exercise.model";
import {map} from "rxjs/operators";
import {AngularFirestore} from "angularfire2/firestore";
import {Injectable} from "@angular/core";
import { Subscription } from "rxjs";

@Injectable()
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercices: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore) {

  }

  public fetchAvailableExercises() {
    this.fbSubs.push(
      this.db
        .collection('availableExercises')
        .snapshotChanges()
        .pipe(map(docArray => {
          return docArray.map( doc => {
            return {
              id:  doc.payload.doc.id,
              name: doc.payload.doc.data()['name'],
              duration: doc.payload.doc.data()['duration'],
              calories: doc.payload.doc.data()['calories'],
            }
          })
        }))
        .subscribe((exercises: Exercise[]) => {
          this.exercisesChanged.next([...exercises]);
        }, error => {
          console.log(error);
        })
    );
  }

  startExercise(selectedId: string) {
    this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
    this.runningExercise = this.availableExercices.find(
      ex => ex.id === selectedId
    );

    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase(
      {...this.runningExercise,
        date: new Date(),
        state: 'completed'
      });

    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
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

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db.
      collection('finishedExercises').
      valueChanges().
      subscribe((exercices: Exercise[]) => {
        this.finishedExercisesChanged.next(exercices);
      }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
