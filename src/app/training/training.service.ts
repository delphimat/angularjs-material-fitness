import { Subject } from "rxjs";

import {Exercise} from "./exercise.model";

export class TrainingService {

  exerciseChanged = new Subject<Exercise>();

  private availableExercices: Exercise[] = [
    {id: 'crunches', name: 'Crunches', duration: 30, calories: 8},
    {id: 'touch-toes', name: 'Touch toes', duration: 180, calories: 15},
    {id: 'side-lunges', name: 'Side lunges', duration: 180, calories: 18},
    {id: 'burpees', name: 'Burpees', duration: 60, calories: 8},
  ];

  private runningExercise: Exercise;

  private completedExercises: Exercise[];

  public getAvailableExercises() {
    return this.availableExercices.slice();
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
  }

  getRunningExercise() {
    return {...this.runningExercise } ;
  }
}
