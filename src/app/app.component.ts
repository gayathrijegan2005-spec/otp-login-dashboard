import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private http: HttpClient) {}

  username = '';
  password = '';

  showOTP = false;

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';

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

  // OTP LIMIT
  otpAttempts = 0;
  maxOtpAttempts = 5;
  otpBlocked = false;

  // BLOCKED EMAIL STORAGE
  blockedEmails: string[] = [];

  // LOGIN VALIDATION
  login() {

    // ACCEPT ALL VALID EMAILS
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    // EMPTY CHECK
    if (!this.username || !this.password) {

      this.popupMessage =
        "Please enter email and password";

      this.showPopup = true;
      return;
    }

    // EMAIL VALIDATION
    if (!emailPattern.test(this.username)) {

      this.popupMessage =
        "Enter valid email address";

      this.showPopup = true;
      return;
    }

    // PASSWORD VALIDATION
    if (!passwordPattern.test(this.password)) {

      this.popupMessage =
        "Password must contain uppercase, lowercase, number and special character";

      this.showPopup = true;
      return;
    }

    // PERMANENT EMAIL BLOCK CHECK
    if (
      this.blockedEmails.includes(
        this.username
      )
    ) {

      this.popupMessage =
        "This email address has been blocked due to multiple wrong OTP attempts. Please try with another mail id.";

      this.showPopup = true;
      return;
    }

    // SHOW OTP
    this.showOTP = true;

    // SEND REAL OTP
    this.generateOTP();
  }

  // SEND OTP TO EMAIL
  generateOTP() {

    this.http.post<any>(

      'http://localhost:5000/send-otp',

      {
        email: this.username
      }

    ).subscribe({

      next: () => {

        this.showOTPText = true;

        this.message =
          "OTP sent successfully to your Email ✅";

        this.startTimer();
      },

      error: () => {

        this.popupMessage =
          "Failed to send OTP";

        this.showPopup = true;
      }
    });
  }

  // OTP TIMER
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

  // RESEND OTP
  resendOTP() {

    // PERMANENT BLOCK CHECK
    if (
      this.blockedEmails.includes(
        this.username
      )
    ) {

      this.popupMessage =
        "This email address has been blocked due to multiple wrong OTP attempts. Please try with another mail id.";

      this.showPopup = true;
      return;
    }

    this.generateOTP();

    this.message = '';
  }

  // GREETING
  setGreeting() {

    const hour = new Date().getHours();

    if (hour < 12)
      this.userGreeting = "Good Morning ☀️";

    else if (hour < 18)
      this.userGreeting = "Good Afternoon 🌤️";

    else
      this.userGreeting = "Good Evening 🌙";
  }

  // AUTO VERIFY
  onLastInput() {

    setTimeout(() => {

      if (
        this.otp1 &&
        this.otp2 &&
        this.otp3 &&
        this.otp4
      ) {

        this.verify();
      }

    }, 0);
  }

  // VERIFY OTP
  verify() {

    // BLOCK CHECK
    if (
      this.blockedEmails.includes(
        this.username
      )
    ) {

      this.popupMessage =
        "This email address has been blocked due to multiple wrong OTP attempts. Please try with another mail id.";

      this.showPopup = true;

      return;
    }

    const enteredOTP =
      this.otp1 +
      this.otp2 +
      this.otp3 +
      this.otp4;

    // VERIFY FROM BACKEND
    this.http.post<any>(

      'http://localhost:5000/verify-otp',

      {
        otp: enteredOTP
      }

    ).subscribe((res) => {

      // CORRECT OTP
      if (res.success) {

        this.message =
          "OTP Verified Successfully ✅";

        this.setGreeting();

        // RESET ATTEMPTS
        this.otpAttempts = 0;

        // SMOOTH DELAY
        setTimeout(() => {

          this.isLoggedIn = true;

          this.showOTP = false;

        }, 1200);

      }

      // WRONG OTP
      else {

        this.otpAttempts++;

        const remaining =
          this.maxOtpAttempts - this.otpAttempts;

        // LIMIT REACHED
        if (this.otpAttempts >= this.maxOtpAttempts) {

          // SAVE BLOCKED EMAIL
          this.blockedEmails.push(
            this.username
          );

          // STORE IN LOCAL STORAGE
          localStorage.setItem(
            'blockedEmails',
            JSON.stringify(this.blockedEmails)
          );

          this.showOTP = false;

          this.popupMessage =
            "This email address has been blocked due to multiple wrong OTP attempts. Please try with another mail id.";

          this.showPopup = true;
        }

        // SHOW REMAINING ATTEMPTS
        else {

          this.message =
            `Entered OTP is wrong ❌
Attempts left: ${remaining}`;
        }
      }

      this.clearInputs();
    });
  }

  // CLEAR OTP
  clearInputs() {

    this.otp1 = '';
    this.otp2 = '';
    this.otp3 = '';
    this.otp4 = '';
  }

  // CANCEL OTP
  cancel() {

    this.showOTP = false;

    this.message = '';
  }

  // LOGOUT
  logout() {

    this.isLoggedIn = false;

    this.username = '';

    this.password = '';

    this.message = '';
  }

  // CLOSE POPUP
  closePopup() {

    this.showPopup = false;
  }

  // NEXT OTP INPUT
  moveNext(event: any, next: any) {

    if (
      event.target.value.length === 1 &&
      next
    ) {

      next.focus();
    }
  }

  // PREVIOUS OTP INPUT
  movePrev(event: any, prev: any) {

    if (
      event.key === 'Backspace' &&
      !event.target.value &&
      prev
    ) {

      prev.focus();
    }
  }

  // SIDEBAR MENU
  setMenu(menu: string) {

    this.activeMenu = menu;
  }

  // LIVE TIME
  ngOnInit() {

    // LOAD BLOCKED EMAILS
    const storedEmails =
      localStorage.getItem('blockedEmails');

    if (storedEmails) {

      this.blockedEmails =
        JSON.parse(storedEmails);
    }

    // LIVE TIME
    setInterval(() => {

      this.currentTime =
        new Date().toLocaleTimeString();

    }, 1000);
  }
}