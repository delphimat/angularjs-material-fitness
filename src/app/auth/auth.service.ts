import { Subject} from "rxjs";
import { AngularFireAuth } from 'angularfire2/auth';

import {Injectable} from "@angular/core";
import {Router} from "@angular/router";

import {User} from "./user.model";
import {AuthData} from "./auth-data.model";
import {TrainingService} from "../training/training.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UiService} from "./shared/ui.service";

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated : boolean = false;

  constructor(
    private router: Router,
    private afauth: AngularFireAuth,
    private trainingService: TrainingService,
    private snackbar: MatSnackBar,
    private uiService: UiService
    ) {

  }

  initAuthListener() {
    this.afauth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
      } else {
        this.isAuthenticated = false;
        this.trainingService.cancelSubscriptions();
        this.authChange.next(false);
        this.router.navigate(['/login']);

      }
    });
  }

  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afauth.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.snackbar.open(error.message, null, {
          duration: 3000
        });
      })
    ;
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afauth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.snackbar.open(error.message, null, {
          duration: 3000
        });
      })
    ;
  }

  logout() {
    this.afauth.auth.signOut();
  }


  isAuth() {
    return this.isAuthenticated;
  }

}
