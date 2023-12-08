import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user$ = this.usersService.currentUserProfile$;
  isOnline$ = this.usersService.setisOnlineStatus$;
  counts: number[] = []; 
  constructor(private usersService: UsersService) {
  }

  ngOnInit(): void {
    this.isOnline$.subscribe();
  }

  duplicateUser() {
    const newCount = this.counts.length + 1;
    this.counts.push(newCount);
  }
  deleteUser() {
    this.counts.pop();
  }
}
