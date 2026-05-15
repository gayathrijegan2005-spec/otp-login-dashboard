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

  // TEMPORARY BLOCK STORAGE
  blockedUsers: any = {};

  // USER STORAGE
  users: any = {};

  // FORGOT PASSWORD
  showForgotPassword = false;

  forgotEmail = '';

  showResetOTP = false;

  resetOtp1 = '';
  resetOtp2 = '';
  resetOtp3 = '';
  resetOtp4 = '';

  // RESET OTP FEATURES
  resetMessage = '';

  resetTimer = 5;
  resetInterval: any;

  resetOtpAttempts = 0;
  maxResetAttempts = 5;

  showNewPasswordSection = false;

  newPassword = '';
  confirmPassword = '';

  // LOGIN VALIDATION
  login() {

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

    // CHECK STORED PASSWORD
    if (this.users[this.username]) {

      if (
        this.users[this.username] !==
        this.password
      ) {

        this.popupMessage =
          "Incorrect password";

        this.showPopup = true;

        return;
      }
    }

    // CHECK TEMP BLOCK
    const blockedData =
      this.blockedUsers[this.username];

    if (blockedData) {

      const currentTime =
        new Date().getTime();

      const oneHour =
        60 * 60 * 1000;

      if (
        currentTime - blockedData
        < oneHour
      ) {

        this.popupMessage =
          "Too many wrong OTP attempts. Please try again after 1 hour or contact admin.";

        this.showPopup = true;

        return;
      }

      else {

        delete this.blockedUsers[
          this.username
        ];

        localStorage.setItem(
          'blockedUsers',
          JSON.stringify(this.blockedUsers)
        );
      }
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

  // RESET OTP TIMER
  startResetTimer() {

    this.resetTimer = 5;

    clearInterval(this.resetInterval);

    this.resetInterval = setInterval(() => {

      this.resetTimer--;

      if (this.resetTimer === 0) {

        clearInterval(this.resetInterval);
      }

    }, 1000);
  }

  // RESEND OTP
  resendOTP() {

    const blockedData =
      this.blockedUsers[this.username];

    if (blockedData) {

      const currentTime =
        new Date().getTime();

      const oneHour =
        60 * 60 * 1000;

      if (
        currentTime - blockedData
        < oneHour
      ) {

        this.popupMessage =
          "Too many wrong OTP attempts. Please try again after 1 hour or contact admin.";

        this.showPopup = true;

        return;
      }
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

  // AUTO VERIFY LOGIN OTP
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

  // AUTO VERIFY RESET OTP
  onResetLastInput() {

    setTimeout(() => {

      if (
        this.resetOtp1 &&
        this.resetOtp2 &&
        this.resetOtp3 &&
        this.resetOtp4
      ) {

        this.verifyResetOTP();
      }

    }, 0);
  }

  // VERIFY LOGIN OTP
  verify() {

    const blockedData =
      this.blockedUsers[this.username];

    if (blockedData) {

      const currentTime =
        new Date().getTime();

      const oneHour =
        60 * 60 * 1000;

      if (
        currentTime - blockedData
        < oneHour
      ) {

        this.popupMessage =
          "Too many wrong OTP attempts. Please try again after 1 hour or contact admin.";

        this.showPopup = true;

        return;
      }
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

      // SUCCESS
      if (res.success) {

        this.message =
          "OTP Verified Successfully ✅";

        this.setGreeting();

        this.otpAttempts = 0;

        // SAVE USER
        this.users[this.username] =
          this.password;

        localStorage.setItem(
          'users',
          JSON.stringify(this.users)
        );

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

        if (this.otpAttempts >= this.maxOtpAttempts) {

          this.blockedUsers[
            this.username
          ] = new Date().getTime();

          localStorage.setItem(
            'blockedUsers',
            JSON.stringify(this.blockedUsers)
          );

          this.showOTP = false;

          this.popupMessage =
            "Too many wrong OTP attempts. Please try again after 1 hour or contact admin.";

          this.showPopup = true;
        }

        else {

          this.message =
            `Entered OTP is wrong ❌
Attempts left: ${remaining}`;
        }
      }

      // CLEAR OTP
      this.clearInputs();

      // MOVE CURSOR TO FIRST OTP BOX
      setTimeout(() => {

        const firstInput =
          document.getElementById(
            'otp1'
          ) as HTMLInputElement;

        if (firstInput) {

          firstInput.focus();
        }

      }, 0);

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

        this.startResetTimer();

        this.resetMessage =
          "Reset OTP sent successfully ✅";
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

      // SUCCESS
      if (res.success) {

        this.resetMessage =
          "Reset OTP Verified Successfully ✅";

        this.resetOtpAttempts = 0;

        setTimeout(() => {

          this.showResetOTP = false;

          this.showNewPasswordSection = true;

        }, 1000);
      }

      // WRONG OTP
      else {

        this.resetOtpAttempts++;

        const remaining =
          this.maxResetAttempts -
          this.resetOtpAttempts;

        if (
          this.resetOtpAttempts >=
          this.maxResetAttempts
        ) {

          this.popupMessage =
            "Too many wrong Reset OTP attempts.";

          this.showPopup = true;

          this.showResetOTP = false;
        }

        else {

          this.resetMessage =
            `Entered Reset OTP is wrong ❌
Attempts left: ${remaining}`;
        }
      }

      // CLEAR RESET OTP
      this.resetOtp1 = '';
      this.resetOtp2 = '';
      this.resetOtp3 = '';
      this.resetOtp4 = '';

      // MOVE CURSOR TO FIRST RESET OTP BOX
      setTimeout(() => {

        const firstInput =
          document.getElementById(
            'resetOtp1'
          ) as HTMLInputElement;

        if (firstInput) {

          firstInput.focus();
        }

      }, 0);

    });
  }

  // RESEND RESET OTP
  resendResetOTP() {

    this.sendResetOTP();

    this.resetMessage = '';
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

    this.password =
      this.newPassword;

    // UPDATE STORED PASSWORD
    this.users[this.forgotEmail] =
      this.newPassword;

    localStorage.setItem(
      'users',
      JSON.stringify(this.users)
    );

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

    localStorage.removeItem(
      'isLoggedIn'
    );

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

    // LOAD USERS
    const storedUsers =
      localStorage.getItem('users');

    if (storedUsers) {

      this.users =
        JSON.parse(storedUsers);
    }

    // LOAD BLOCKED USERS
    const blockedData =
      localStorage.getItem(
        'blockedUsers'
      );

    if (blockedData) {

      this.blockedUsers =
        JSON.parse(blockedData);
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