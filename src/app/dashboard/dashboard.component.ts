import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { APIConnectionService } from '../../../APIConnectionService/api-connection.service';
import { LoggedUserDataServiceService } from '../../../LoggedUserData/logged-user-data-service.service';
import { catchError, map, throwError } from 'rxjs';
import { userMessage } from '../../../Models/userMessage';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../Models/user';
import { Router } from '@angular/router';
import MetaMaskSDK from '@metamask/sdk';
import { InfuraAPIKey } from '../../../env';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{

  messagess : any;
  users : any;
  objectsToDisplay = new Array();
  usersArrived = new Array();
  MessageToSendForm: FormGroup;
  formDataMessage: FormData;
  currentUserToSendMessageTo : any;
  ethereum : any;

  constructor(private router1 : Router, private fb : FormBuilder, private appC: AppComponent, private apiComm : APIConnectionService, private apiConn : APIConnectionService, private LoggedUserData : LoggedUserDataServiceService){
    appC.visible_nav = true;
    apiComm.cleanExcessNotifications().subscribe();

    this.MessageToSendForm = this.fb.group({
      Message:"Type message here"
    })

    this.formDataMessage = new FormData();
  }


  ngOnInit(): void {
    const MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: "Orchard",
        url: window.location.href,
      },
      infuraAPIKey: InfuraAPIKey, 
    });
    setTimeout(() => {
      MMSDK.init().then(() => {
        this.ethereum = MMSDK.getProvider();
      });
    }, 0);

    const ID = this.LoggedUserData.GetLoggedUserId();

    this.apiComm.PaymentGettxhash(this.LoggedUserData.LoggedUser.Id)
    .pipe(
      catchError(error => {
        return throwError(() => new Error("Error occured"));
      }),
      map((response) => {
        const data = response.body;
        return{data};
      })
    )
    .subscribe({
      next: (result) => {
        const role = result.data.role;
        if(role != "FUA" && role != "NFUA"){
          this.WaitForTransactionConfirmation(role).then(ev => {
            if(ev == 'confirmed'){
              this.apiComm.PaymentStoretxhash(this.LoggedUserData.LoggedUser.Id, "FUA").subscribe(); //GIVE USER FULL ACCESS IF PAYMENT HAS BEED CONFIRMED
              this.LoggedUserData.LoggedUserRole = "FUA";
              this.LoggedUserData.LoggedUser.Role = "FUA";
            }
          })
        }

      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });

    this.apiComm.Get5UsersFromLocation(this.LoggedUserData.LoggedUser.Id, this.LoggedUserData.LoggedUser.Region!, this.LoggedUserData.LoggedUser.City!)
    .pipe(
      catchError(error => {
        return throwError(() => new Error("Error occured"));
      }),
      map((response) => {
        const data = response.body;
        console.log(data);
        let users = new Array();
        data.users.forEach((element: { age: any; city: any; email: any; id: any; profilePhotoPath: any; region: any; gender: any, role: any; username: string}) => {
          let user : User = {
            Id: element.id,
            Username: element.username,
            Email: element.email,
            Role: element.role,
            Gender: element.gender,
            Age: element.age,
            Region: element.region,
            City: element.city,
            ProfilePhoto: element.profilePhotoPath
          };
          users.push(user);
        });
        this.usersArrived = users;
        return { users };
      })
    )
    .subscribe({
      next: (result) => {
        result.users.forEach(element => {
          console.log(element);

          this.apiComm.GetUserImage(element.Id).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const img = document.getElementById(element.Id) as HTMLImageElement;
            img.src = url;
          });
        })
      }
    })



  }

  async WaitForTransactionConfirmation(txhash : string){
    let loop = () => {
      return this.ethereum.request({method: 'eth_getTransactionReceipt', params:[txhash]}).then((ev: any) => {
        if(ev != null){
          return 'confirmed';
        }
        else{
          return loop();
        }
      })
    }

    return await loop();
  }


  SendMSG(Id : any){
    this.currentUserToSendMessageTo = Id;
    this.switchVis();
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

  SendMessage(event : Event){
    this.formDataMessage.set('AuthorId', this.LoggedUserData.GetLoggedUserId()),
    this.formDataMessage.set('DeliveryId', this.currentUserToSendMessageTo),
    this.formDataMessage.set('Content', this.MessageToSendForm.get('Message')?.value)

    this.apiConn.PermitMesssageSend(this.LoggedUserData.LoggedUser.Id)
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
        this.apiConn.SendUserMessage(this.formDataMessage).subscribe({
          next: (result) => {
            console.log(result);
          }
        })
        this.switchVis();
      }
    })
  }

  SeeUserProfile(Id : any): void {
    this.apiConn.GetUserById(Id)
    .pipe(
      catchError(error => {
        if (error.status === 404) {
          alert("Nie znaleziono użytkownika");
        }
        return throwError(() => new Error("Error occured"));
      }),
      map((response) => {
        const data = response.body;
        const user : User = {
          Id: data.userToReturn.id,
          Username: data.userToReturn.username,
          Email: data.userToReturn.email,
          Role: data.userToReturn.role,
          Age: data.userToReturn.age,
          Region: data.userToReturn.region,
          City: data.userToReturn.city,
        };
        this.LoggedUserData.UserToProfileView = user;
        return { user };
      })
    )
    .subscribe({
      next: (result) => {
        this.router1.navigate(['/BrowseUsers']);
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
    
    this.apiConn.SendNotoficationWhenProfileVisited(this.LoggedUserData.LoggedUser.Id, Id).subscribe();
  }
}
  
