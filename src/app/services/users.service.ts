import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { filter, from, map, Observable, of, switchMap, takeUntil, debounceTime, timer, tap } from 'rxjs';
import { ProfileUser } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private firestore: Firestore, private authService: AuthService, private db: AngularFireDatabase) {}

  get currentUserProfile$(): Observable<ProfileUser | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }
        //Firestore version
        // const ref = doc(this.firestore, 'users', user?.uid);
        // return docData(ref) as Observable<ProfileUser>;
        console.log(`User UID: ${user.uid}`);
        return this.db.object<ProfileUser>(`Users/${user.uid}`).valueChanges();
      })
    );
  }

  get setisOnlineStatus$(): Observable<ProfileUser | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }
  
        const userProfile$ = this.db.object<boolean>(`Users/${user.uid}/isFlag`).valueChanges();
  
        // Create a timer that emits after 15 seconds
        const timer$ = timer(2000);
  
        // Combine the user profile data with the timer
        return userProfile$.pipe(
          switchMap((userProfile) =>
            timer$.pipe(
              debounceTime(1000), // Debounce for 1 second to avoid premature setting to false
              takeUntil(userProfile$) // Cancel the timer if the profile data changes
            )
          ),
          switchMap(() => {
            // At this point, 15 seconds have passed without changes
            console.log('User is offline now');
  
            // Set isOnline to false in the database
            return this.updateUserOnlineStatus(user.uid, false).pipe(
              switchMap(() => of({ ...user, isOnline: false } as ProfileUser))
            );
          })
        );
      })
    );
  }
  
  private updateUserOnlineStatus(uid: string, isOnline: boolean): Observable<void> {
    return from(this.db.object(`Users/${uid}`).update({ isOnline }));
  }

  addUser(user: ProfileUser): Observable<void> {
    // const ref = doc(this.firestore, 'users', user.uid);
    // return from(setDoc(ref, user));
    return from(this.db.object(`Users/${user.uid}`).set(user));
  }

  updateUser(user: ProfileUser): Observable<void> {
    // const ref = doc(this.firestore, 'users', user.uid);
    // return from(updateDoc(ref, { ...user }));
    return from(this.db.object(`Users/${user.uid}`).update({ ...user }));
  }
}
