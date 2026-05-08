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

  // REMEMBER ME
  rememberMe = false;

  // OTP LIMIT
  otpAttempts = 0;
  maxOtpAttempts = 5;
  otpBlocked = false;

  // BLOCKED EMAIL STORAGE
  blockedEmails: string[] = [];

  // FORGOT PASSWORD
  showForgotPassword = false;

  forgotEmail = '';

  showResetOTP = false;

  resetOtp1 = '';
  resetOtp2 = '';
  resetOtp3 = '';
  resetOtp4 = '';

  showNewPasswordSection = false;

  newPassword = '';
  confirmPassword = '';

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

    // SAVE LOGIN DATA
    if (this.rememberMe) {

      localStorage.setItem(
        'savedEmail',
        this.username
      );

      localStorage.setItem(
        'savedPassword',
        this.password
      );

      localStorage.setItem(
        'rememberMe',
        'true'
      );
    }

    // SHOW OTP
    this.showOTP = true;

    // SEND REAL OTP
    this.generateOTP();
  }

  // SEND OTP
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

        this.otpAttempts = 0;

        setTimeout(() => {

          this.isLoggedIn = true;

          localStorage.setItem(
            'isLoggedIn',
            'true'
          );

          this.showOTP = false;

        }, 1200);

      }

      // WRONG OTP
      else {

        this.otpAttempts++;

        const remaining =
          this.maxOtpAttempts - this.otpAttempts;

        // BLOCK EMAIL
        if (this.otpAttempts >= this.maxOtpAttempts) {

          this.blockedEmails.push(
            this.username
          );

          localStorage.setItem(
            'blockedEmails',
            JSON.stringify(this.blockedEmails)
          );

          this.showOTP = false;

          this.popupMessage =
            "This email address has been blocked due to multiple wrong OTP attempts. Please try with another mail id.";

          this.showPopup = true;
        }

        else {

          this.message =
            `Entered OTP is wrong ❌
Attempts left: ${remaining}`;
        }
      }

      this.clearInputs();
    });
  }

  // OPEN FORGOT PASSWORD
  openForgotPassword() {

    this.showForgotPassword = true;
  }

  // CLOSE FORGOT PASSWORD
  closeForgotPassword() {

    this.showForgotPassword = false;
  }

  // SEND RESET OTP
  sendResetOTP() {

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(this.forgotEmail)) {

      this.popupMessage =
        "Enter valid email address";

      this.showPopup = true;

      return;
    }

    this.http.post<any>(

      'http://localhost:5000/send-otp',

      {
        email: this.forgotEmail
      }

    ).subscribe({

      next: () => {

        this.showForgotPassword = false;

        this.showResetOTP = true;

        this.popupMessage =
          "Reset OTP sent successfully";

        this.showPopup = true;
      },

      error: () => {

        this.popupMessage =
          "Failed to send reset OTP";

        this.showPopup = true;
      }
    });
  }

  // VERIFY RESET OTP
  verifyResetOTP() {

    const enteredOTP =
      this.resetOtp1 +
      this.resetOtp2 +
      this.resetOtp3 +
      this.resetOtp4;

    this.http.post<any>(

      'http://localhost:5000/verify-otp',

      {
        otp: enteredOTP
      }

    ).subscribe((res) => {

      if (res.success) {

        this.showResetOTP = false;

        this.showNewPasswordSection = true;
      }

      else {

        this.popupMessage =
          "Invalid Reset OTP";

        this.showPopup = true;
      }
    });
  }

  // UPDATE PASSWORD
  updatePassword() {

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (
      !passwordPattern.test(
        this.newPassword
      )
    ) {

      this.popupMessage =
        "Password format is invalid";

      this.showPopup = true;

      return;
    }

    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.popupMessage =
        "Passwords do not match";

      this.showPopup = true;

      return;
    }

    // UPDATE PASSWORD
    this.password =
      this.newPassword;

    this.showNewPasswordSection = false;

    this.popupMessage =
      "Password updated successfully";

    this.showPopup = true;
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

    this.message = '';

    // CLEAR LOGIN STATE
    localStorage.removeItem(
      'isLoggedIn'
    );

    // CLEAR ONLY IF NOT REMEMBERED
    if (!this.rememberMe) {

      this.username = '';

      this.password = '';

      localStorage.removeItem(
        'savedEmail'
      );

      localStorage.removeItem(
        'savedPassword'
      );

      localStorage.removeItem(
        'rememberMe'
      );
    }
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

    // LOAD SAVED LOGIN
    const savedEmail =
      localStorage.getItem('savedEmail');

    const savedPassword =
      localStorage.getItem('savedPassword');

    const remember =
      localStorage.getItem('rememberMe');

    const loggedIn =
      localStorage.getItem('isLoggedIn');

    if (
      remember === 'true'
    ) {

      this.username =
        savedEmail || '';

      this.password =
        savedPassword || '';

      this.rememberMe = true;
    }

    // AUTO LOGIN
    if (
      loggedIn === 'true'
    ) {

      this.isLoggedIn = true;

      this.setGreeting();
    }

    // LIVE TIME
    setInterval(() => {

      this.currentTime =
        new Date().toLocaleTimeString();

    }, 1000);
  }
}