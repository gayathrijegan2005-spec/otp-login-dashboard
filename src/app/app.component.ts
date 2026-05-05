import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  username = '';
  password = '';

  showOTP = false;

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';

  generatedOTP = '';
  showOTPText = false;

  message = '';

  timer = 5;
  interval: any;

  popupMessage = '';
  showPopup = false;

  isLoggedIn = false;
  userGreeting = '';

  activeMenu = 'dashboard';
  currentTime = '';

  login() {
    if (this.username && this.password) {
      this.showOTP = true;
      this.generateOTP();
    } else {
      this.popupMessage = "Please enter username and password to login";
      this.showPopup = true;
    }
  }

  generateOTP() {
    this.generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    this.showOTPText = true;
    this.startTimer();
  }

  startTimer() {
    this.timer = 5;
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        this.showOTPText = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  resendOTP() {
    this.generateOTP();
    this.message = '';
  }

  setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) this.userGreeting = "Good Morning ☀️";
    else if (hour < 18) this.userGreeting = "Good Afternoon 🌤️";
    else this.userGreeting = "Good Evening 🌙";
  }

  // ✅ AUTO VERIFY WHEN LAST DIGIT ENTERED
  onLastInput() {
    setTimeout(() => {
      if (this.otp1 && this.otp2 && this.otp3 && this.otp4) {
        this.verify();
      }
    }, 0);
  }

  verify() {
    const enteredOTP = this.otp1 + this.otp2 + this.otp3 + this.otp4;

    if (enteredOTP === this.generatedOTP) {
      this.message = "OTP Verified Successfully ✅";
      this.setGreeting();

      // ✅ smooth delay before dashboard
      setTimeout(() => {
        this.isLoggedIn = true;
        this.showOTP = false;
      }, 1200); // 1.2 seconds delay

    } else {
      this.message = "Entered OTP is wrong ❌";
    }

    this.clearInputs();
  }

  clearInputs() {
    this.otp1 = this.otp2 = this.otp3 = this.otp4 = '';
  }

  cancel() {
    this.showOTP = false;
    this.message = '';
  }

  logout() {
    this.isLoggedIn = false;
    this.username = '';
    this.password = '';
    this.message = '';
  }

  closePopup() {
    this.showPopup = false;
  }

  moveNext(event: any, next: any) {
    if (event.target.value.length === 1 && next) {
      next.focus();
    }
  }

  movePrev(event: any, prev: any) {
    if (event.key === 'Backspace' && !event.target.value && prev) {
      prev.focus();
    }
  }

  setMenu(menu: string) {
    this.activeMenu = menu;
  }

  ngOnInit() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  }
}