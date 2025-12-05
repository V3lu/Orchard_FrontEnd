import { Component, OnInit } from '@angular/core';
import { APIConnectionService } from '../../../APIConnectionService/api-connection.service';
import { LoggedUserDataServiceService } from '../../../LoggedUserData/logged-user-data-service.service';
import { User } from '../../../Models/user';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-other-user-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './other-user-profile.component.html',
  styleUrl: './other-user-profile.component.css'
})
export class OtherUserProfileComponent{

  userToView! : User;
  MessageToSendForm: FormGroup;
  formData! : FormData;

  constructor(private fb : FormBuilder, private apiconn : APIConnectionService, private loggedUserData : LoggedUserDataServiceService){
    this.apiconn.GetUserImage(loggedUserData.UserToProfileView.Id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const img = document.getElementById('image') as HTMLImageElement;
      img.src = url;
    });

    this.MessageToSendForm = this.fb.group({
      Message:"Type message here"
    })
    this.formData = new FormData();

    this.userToView = loggedUserData.UserToProfileView;
  }

  switchVis(){
    var item = document.getElementById('modal')?.className;
    if(item == "modal"){
      document.getElementById('modal')?.setAttribute("class", "modal is-active");
    }
    else{
      document.getElementById('modal')?.setAttribute("class", "modal");
    }
  }

  switchVis2(){
    var item = document.getElementById('modal2')?.className;
    if(item == "modal"){
      document.getElementById('modal2')?.setAttribute("class", "modal is-active");
    }
    else{
      document.getElementById('modal2')?.setAttribute("class", "modal");
    }
  }

  SubmitData(event: Event): void {
    const deli = this.loggedUserData.UserToProfileView.Id!.toString();
    this.formData.set('AuthorId', this.loggedUserData.GetLoggedUserId()),
    this.formData.set('DeliveryId', deli),
    this.formData.set('Content', this.MessageToSendForm.get('Message')?.value)

    this.apiconn.PermitMesssageSend(this.loggedUserData.LoggedUser.Id)
    .pipe(
      catchError(error => {
        if (error.status === 404) {
          this.switchVis();
          this.switchVis2();
        }
        return throwError(() => new Error("Error occured"));
      }),
      map((response) => {
        const data = response.body;
        return{data};
      })
    )
    .subscribe({
      next: (result) => {
        this.apiconn.SendUserMessage(this.formData).subscribe({
          next: (result) => {
            console.log(result);
          }
        })
        this.switchVis();
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }
}
