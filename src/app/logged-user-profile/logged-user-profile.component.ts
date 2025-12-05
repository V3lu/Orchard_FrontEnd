import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { APIConnectionService } from '../../../APIConnectionService/api-connection.service';
import { LoggedUserDataServiceService } from '../../../LoggedUserData/logged-user-data-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logged-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './logged-user-profile.component.html',
  styleUrl: './logged-user-profile.component.css'
})
export class LoggedUserProfileComponent {

  usernameSignal = signal('');
  passwordSignal = signal('');
  emailSignal = signal('');
  regionSignal = signal('');
  citySignal = signal('');
  ageSignal = signal('');

  usernameForm : String = "";
  passwordForm : String = "";
  emailForm : String = "";
  regionForm : String = "";
  cityForm : String = "";
  ageForm : number = 0;

  passwordIcon : boolean = true;
  ageIcon : boolean = true;
  usernameIcon : boolean = true;
  emailIcon : boolean = true;
  cityIcon : boolean = true;

  isPasswordProper : boolean = true;
  isAgeProper : boolean = true;
  isEmailProper : boolean = true;
  isCityProper : boolean = true;

  canSendForm : boolean = false;
  isUsernameEmpty : boolean = false;
  isAgeEmpty : boolean = false;
  cannotSendFormData : boolean = false;
  ProfilePhotoToSend : any;
  userdataform: FormGroup;
  region: any;
  formData! : FormData;
  LoggedUserRole! : String;
  selectedWojewodztwo : any;

  userSex?: string = 'sex';

  doesUsernameExists : boolean = false;
  doesEmailExist : boolean = false;
  wojewodztwa: string[] = ['Zachodnio-Pomorskie', 'Pomorskie', 'Warmińsko-Mazurskie',
                                  'Podlaskie', 'Mazowieckie', 'Kujawsko-Pomorskie',
                                    'Wielkopolskie', 'Lubuskie', 'Dolnośląskie',
                                      'Łódzkie', 'Lubelskie', 'Podkarpackie',
                                        'Małopolskie', 'Śląskie', 'Opolskie',];

  constructor(private fb : FormBuilder, private apiComm : APIConnectionService, private loggedUserData : LoggedUserDataServiceService, private router1 : Router){
    this.LoggedUserRole = loggedUserData.GetLoggedUserRole();
    this.formData = new FormData();
    this.userSex = loggedUserData.LoggedUser.Sex;
    this.selectedWojewodztwo = loggedUserData.LoggedUser.Region;
    this.userdataform = this.fb.group({
      username:loggedUserData.LoggedUser.Username,
      email:loggedUserData.LoggedUser.Email,
      photo:loggedUserData.LoggedUser.ProfilePhoto,
      password: "",
      region:loggedUserData.LoggedUser.Region,
      age:loggedUserData.LoggedUser.Age,
      city:loggedUserData.LoggedUser.City
    })
    this.usernameSignal.set(loggedUserData.LoggedUser.Username!);
    this.emailSignal.set(loggedUserData.LoggedUser.Email!);
    this.citySignal.set(loggedUserData.LoggedUser.City!);
    this.ageSignal.set(loggedUserData.LoggedUser.Age?.toString()!);
    this.regionSignal.set(loggedUserData.LoggedUser.Region!);
    const LId = loggedUserData.GetLoggedUserId();
    apiComm.GetUserImage(LId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const img = document.getElementById('image') as HTMLImageElement;
      img.src = url;
      const img2 = document.getElementById('image2') as HTMLImageElement;
      img2.src = url;
    });
  }

  GetUsernameFromSignal() : string {
    return this.usernameSignal();
  }

  GetCityFromSignal() : string {
    return this.citySignal();
  }

  GetRegionFromSignal() : string {
    return this.regionSignal();
  }

  GetAgeFromSignal() : string{
    return this.ageSignal().toString();
  }

  GetRole() : string | undefined {
    return this.loggedUserData.LoggedUser.Role;
  }

  CheckPassword(){
    const value = this.passwordSignal();
    const hasNumber = value.match("[0-9]+");
    const hasSpecialChar = value.match("[^A-Za-z0-9]");
    if(value.length < 8 || hasNumber?.length == null || hasSpecialChar?.length == null){
      this.passwordIcon = true;
      this.isPasswordProper = false;
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    if(value.length >= 8 && hasNumber?.length != null && hasSpecialChar?.length != null){
      this.passwordIcon = false;
      this.isPasswordProper = true;
      this.UnlockSubmitButton()
    }
  }

  CheckCity(){
    const value = this.citySignal();
    if(value == ""){
      this.cityIcon = false;
      this.isCityProper = false;
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.cityIcon = true;
      this.isCityProper = true;
      this.UnlockSubmitButton()
    }
  }

  CheckUsername(){
    const value = this.usernameSignal();
    if(value == ""){
      this.isUsernameEmpty = true;
      this.usernameIcon = false;
      this.doesUsernameExists = false;
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.isUsernameEmpty = false;
      this.usernameIcon = true;
      this.apiComm.CheckIfUsernameExists(this.userdataform.get('username')?.value).subscribe({
        next: (result) => {
          const data = result.body;
          this.doesUsernameExists = data;
          if(this.loggedUserData.LoggedUser.Username == this.userdataform.get('username')?.value){
            this.doesUsernameExists = false;
            this.UnlockSubmitButton()
          }
          if(data == false){
            this.usernameIcon = true;
            this.UnlockSubmitButton()
          }
          else if(data == true && this.loggedUserData.LoggedUser.Username == this.userdataform.get('username')?.value){
            this.usernameIcon = true;
            this.UnlockSubmitButton()
          }
          else{
            this.usernameIcon = false;
          }
        }
      })
    }
  }

  assignUsername(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.usernameSignal.set(value);
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
  assignRegion(event : Event){
    const value = (event.target as HTMLInputElement).value;
    this.regionSignal.set(value);
  }

  CheckEmail(){
    const value = this.emailSignal();
    const hasNumber = value.match("[@]");
    const hasSpecialChar = value.match("[.]\\S+");
    if(hasNumber?.length == null || hasSpecialChar?.length == null){
      this.emailIcon = false;
      this.isEmailProper = false
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    if(hasNumber?.length != null && hasSpecialChar?.length != null){
      this.emailIcon = true;
      this.isEmailProper = true
      this.apiComm.CheckIfEmailExists(this.userdataform.get('email')?.value).subscribe({
        next: (result) => {
          const data = result.body;
          this.doesEmailExist = data;
          if(this.loggedUserData.LoggedUser.Email == this.userdataform.get('email')?.value){
            this.doesEmailExist = false;
            this.UnlockSubmitButton()
          }
          if(this.doesEmailExist == true){
            document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
          }
          if(data == false){
            this.emailIcon = true;
            this.UnlockSubmitButton()
          }
          else if(data == true && this.loggedUserData.LoggedUser.Email == this.userdataform.get('email')?.value){
            this.emailIcon = true;
            this.UnlockSubmitButton()
          }
          else{
            this.emailIcon = false;
          }
        }
      })
    }
  }

  CheckAge(){
    const value = this.ageSignal();
    const isNaN = value.match("[^0-9]+");
    if(isNaN?.length != null){
      this.ageIcon = false;
      this.isAgeProper = false;
      this.isAgeEmpty = false;
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    else if(value == ""){
      this.isAgeEmpty = true;
      this.ageIcon = false;
      this.isAgeProper = true;
      document.getElementById("submitbtn")?.setAttribute('disabled', 'disabled');
    }
    else{
      this.ageIcon = true;
      this.isAgeProper = true;
      this.isAgeEmpty = false;
      this.UnlockSubmitButton()
    }
  }

  UnlockSubmitButton(){
    if(this.usernameSignal() != '' && this.passwordSignal() != '' && this.emailSignal() != '' && this.citySignal() != '' && this.ageSignal() != '' && this.selectedWojewodztwo != '' && this.IsFormDoneCorrectly()){
      document.getElementById("submitbtn")?.removeAttribute('disabled');
    }
  }

  IsFormDoneCorrectly() : boolean {
    if(!this.isAgeEmpty && !this.doesUsernameExists && !this.isUsernameEmpty && this.isPasswordProper && !this.doesEmailExist && this.isEmailProper && this.isAgeProper && this.isCityProper){
      return true;
    }
    else{
      return false;
    }
  }

  SubmitData(event: Event): void{
    if(this.usernameSignal() == '' || this.passwordSignal() == '' || this.emailSignal() == '' || this.citySignal() == '' || this.ageSignal() == '' || this.selectedWojewodztwo == ''){
      this.cannotSendFormData = true;
    }
    else{
      event.preventDefault();
      this.cannotSendFormData = false;
      this.formData.set('Id', this.loggedUserData.GetLoggedUserId()),    
      this.formData.set('Username', this.userdataform.get('username')?.value),
      this.formData.set('Password', this.userdataform.get('password')?.value),
      this.formData.set('Role', this.loggedUserData.GetLoggedUserRole()),
      this.formData.set('Email', this.userdataform.get('email')?.value),
      this.formData.set('Region', this.selectedWojewodztwo),
      this.formData.set('Age', this.userdataform.get('age')?.value),
      this.formData.set('City', this.userdataform.get('city')?.value)
      this.apiComm.UpdateUserData(this.formData).subscribe({
          next: (result) => {
            const data = result.body;
            this.loggedUserData.LoggedUser.Id = data.id;
            this.loggedUserData.LoggedUser.Age = data.age;
            this.loggedUserData.LoggedUser.City = data.city;
            this.loggedUserData.LoggedUser.Email = data.email;
            this.loggedUserData.LoggedUser.ProfilePhoto = data.profilePhotoPath;
            this.loggedUserData.LoggedUser.Region = data.region;
            this.loggedUserData.LoggedUser.Role = data.role;
            this.loggedUserData.LoggedUser.Username = data.username;
            this.loggedUserData.LoggedUserId = data.id;
            this.loggedUserData.LoggedUserRole = data.role;
          }
        })
        this.router1.navigate(['/Dashboard']);
    }

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      let file = input.files[0];
      this.ProfilePhotoToSend = file;
      this.formData.set('ProfilePhoto', file);
      this.convertFileToByteArray(file).then((byteArray) => {
        this.displayImageFromByteArray(byteArray);
      });
    }
  }

  convertFileToByteArray(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const byteArray = new Uint8Array(arrayBuffer);
        resolve(byteArray);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  displayImageFromByteArray(byteArray: Uint8Array): void {
    const blob = new Blob([byteArray], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = document.getElementById('image') as HTMLImageElement;
    img.src = url;
    const img2 = document.getElementById('image2') as HTMLImageElement;
    img2.src = url;
  }
}
