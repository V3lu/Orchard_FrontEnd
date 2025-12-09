import { Component, signal } from '@angular/core';
import { AppComponent } from '../app.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../Models/user';
import { CommonModule } from '@angular/common';
import { APIConnectionService } from '../../../APIConnectionService/api-connection.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoggedUserDataServiceService } from '../../../LoggedUserData/logged-user-data-service.service';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  usernameSignal = signal('');
  passwordSignal = signal('');
  emailSignal = signal('');
  regionSignal = signal('');
  citySignal = signal('');
  ageSignal = signal('');
  genderSignal = signal('');

  usernameForm : String = "";
  passwordForm : String = "";
  emailForm : String = "";
  regionForm : String = "";
  cityForm : String = "";
  ageForm : number = 0;

  usernameIcon : boolean = true;
  emailIcon : boolean = true;
  passwordIcon : boolean = true;
  ageIcon : boolean = true;
  cityIcon : boolean = true;

  cannotSendFormData : boolean = false;
  isUserRegisteredAlready : boolean = false;
  
  doesUsernameExists : boolean = false;
  isUsernameEmpty : boolean = false;
  doesEmailExist : boolean = false;
  isAgeEmpty : boolean = false;
  isEmailProper : boolean = true;
  ispasswordProper : boolean = true;
  isGenderProper: boolean = false;
  isCityProper : boolean = true;
  isAgeProper : boolean = true;
  registeredUser : User = {};
  registerForm!: FormGroup;
  selectedWojewodztwo : string = '';
  wojewodztwa: string[] = ['Zachodnio-Pomorskie', 'Pomorskie', 'Warmińsko-Mazurskie',
                                  'Podlaskie', 'Mazowieckie', 'Kujawsko-Pomorskie',
                                    'Wielkopolskie', 'Lubuskie', 'Dolnośląskie',
                                      'Łódzkie', 'Lubelskie', 'Podkarpackie',
                                        'Małopolskie', 'Śląskie', 'Opolskie',];
  constructor(private appComponent : AppComponent, private fb : FormBuilder, private apicomm : APIConnectionService, private router: Router, private loggedUserData : LoggedUserDataServiceService){
    appComponent.visible_nav = false;
    this.registerForm = this.fb.group({
      Username: [''],
      Password: [''],
      Gender: [''],
      Email: [''],
      Region: [''],
      Age: [''],
      City: [''],
    });

  }
  
  assignUsername(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.usernameSignal.set(value);
  }
  assignGender(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.genderSignal.set(value);
  }
  assignPassword(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.passwordSignal.set(value);
  }
  assignEmail(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.emailSignal.set(value);
  }
  assignCity(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.citySignal.set(value);
  }
  assignAge(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.ageSignal.set(value);
  }

  CheckPassword(){
    const value = this.passwordSignal();
    const hasNumber = value.match("[0-9]+");
    const hasSpecialChar = value.match("[^A-Za-z0-9]");
    if(value.length < 8 || hasNumber?.length == null || hasSpecialChar?.length == null){
      this.passwordIcon = true;
      this.ispasswordProper = false;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    if(value.length >= 8 && hasNumber?.length != null && hasSpecialChar?.length != null){
      this.passwordIcon = false;
      this.ispasswordProper = true;
      this.UnlockSubmitButton()
    }
  }

  CheckAge(){
    const value = this.ageSignal();
    const isNaN = value.match("[^0-9]+");
    if(isNaN?.length != null){
      this.ageIcon = true;
      this.isAgeProper = false;
      this.isAgeEmpty = false;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else if(value == ""){
      this.isAgeEmpty = true;
      this.ageIcon = true;
      this.isAgeProper = true;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.ageIcon = false;
      this.isAgeProper = true;
      this.isAgeEmpty = false;
      this.UnlockSubmitButton()
    }
  }

  CheckCity(){
    const value = this.citySignal();
    if(value == ""){
      this.cityIcon = true;
      this.isCityProper = false;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.cityIcon = false;
      this.isCityProper = true;
      this.UnlockSubmitButton()
    }
  }

  CheckGender(){
    const value = this.genderSignal();
    if(value == ""){
      this.isGenderProper = false;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.isGenderProper = true;
      this.UnlockSubmitButton()
    }
  }

  Register(event : Event){
    if(this.usernameSignal() == '' || this.genderSignal() == '' || this.passwordSignal() == '' || this.emailSignal() == '' || this.citySignal() == '' || this.ageSignal() == '' || this.selectedWojewodztwo == ''){
      this.cannotSendFormData = true;
    }
    else{
      event.preventDefault();
      this.cannotSendFormData = false;
      const uname = this.registerForm.get('Username')?.value;
      const pass = this.registerForm.get('Password')?.value;
      const email = this.registerForm.get('Email')?.value;
      const age = this.registerForm.get('Age')?.value;
      const city = this.registerForm.get('City')?.value;
      const sex = this.registerForm.get('Sex')?.value;
      const region = this.selectedWojewodztwo;
  
      this.apicomm.register(uname, pass, email, age, city, region, sex)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            this.isUserRegisteredAlready = true;
          }
          return throwError(() => new Error("Error occured"));
        }),
        map((response) => {
          const data = response.body;
          return{data};
          })
        ).subscribe({
        next: (result) => {
          console.log('API Response:', result);
          this.isUserRegisteredAlready = false;
          this.switchVis();
        }
      })
    }

  }

  Proceedtologin(){
    this.router.navigate(['/'])
  }

  CheckUsername(){
    const value = this.usernameSignal();
    if(value == ""){
      this.isUsernameEmpty = true;
      this.usernameIcon = true;
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.isUsernameEmpty = false;
      this.usernameIcon = false;
      this.UnlockSubmitButton()
    }
    this.apicomm.CheckIfUsernameExists(this.registerForm.get('Username')?.value).subscribe({
      next: (result) => {
        const data = result.body;
        if(data == false){
          this.doesUsernameExists = false;
          if(this.registerForm.get('Username')?.value == ""){
            this.usernameIcon = true;
          }
          else{
            this.usernameIcon = false;
            this.UnlockSubmitButton()
          }
        }
        else{
          this.doesUsernameExists = true;
          this.usernameIcon = true;
          document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
        }
      }
    })
  }

  CheckEmail(){
    const value = this.emailSignal();
    const hasNumber = value.match("[@]");
    const hasSpecialChar = value.match("[.]\\S+");
    if(hasNumber?.length == null || hasSpecialChar?.length == null){
      this.emailIcon = true;
      this.isEmailProper = false
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    if(hasNumber?.length != null && hasSpecialChar?.length != null){
      this.emailIcon = false;
      this.isEmailProper = true
      this.UnlockSubmitButton()
      this.apicomm.CheckIfEmailExists(this.registerForm.get('Email')?.value).subscribe({
        next: (result) => {
          const data = result.body;
          if(data == false){
            this.doesEmailExist = false;
            if(this.registerForm.get('Email')?.value == ""){
              this.emailIcon = true;
            }
            else{
              this.emailIcon = false;
            }
            this.UnlockSubmitButton()
          }
          else{
            this.doesEmailExist = true;
            this.emailIcon = true;
            document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
          }
        }
      })
    }
  }

  CheckRegion(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.regionSignal.set(value);
    if(value == '' || value == ""){
      document.getElementById("btnsub")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.UnlockSubmitButton();
    }
  }

  UnlockSubmitButton(){
    if(this.usernameSignal() != '' && this.genderSignal() != '' && this.passwordSignal() != '' && this.emailSignal() != '' && this.citySignal() != '' && this.ageSignal() != '' && this.regionSignal() != '' && this.IsFormDoneCorrectly()){
      document.getElementById("btnsub")?.removeAttribute('disabled');
    }
  }

  IsFormDoneCorrectly() : boolean {
    if(!this.isAgeEmpty && !this.doesUsernameExists && !this.isUsernameEmpty && this.ispasswordProper && !this.doesEmailExist && this.isEmailProper && this.isAgeProper && this.isCityProper){
      return true;
    }
    else{
      return false;
    }
  }

  switchVis(){
    var item = document.getElementsByClassName('modal')[0].className;
    if(item == "modal"){
      document.getElementsByClassName('modal')[0].setAttribute("class", "modal is-active");
    }
    else{
      document.getElementsByClassName('modal')[0].setAttribute("class", "modal");
    }
  }
}
