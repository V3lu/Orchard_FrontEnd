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
    this.apiConn.GetLast5UserMessagess(ID)
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
        this.messagess = result.data.messages;
        this.users = result.data.users;  
        this.messagess.forEach((message: { authorId: any; content: any; sendDate: Date;}) => {
          this.users.forEach((user: { id: any; username: string; age: number; sex: string}) => {
            if(message.authorId == user.id){
              let prof = new Blob;
              let um : userMessage = {
                ProfilePhoto: prof,
                Sex: user.sex,
                Username: user.username,
                Age: user.age,
                MessageText: ": " + message.content,
                SendDate: message.sendDate,
                AuthorId: user.id
              }
              if(!this.objectsToDisplay.includes(um)){
                this.objectsToDisplay.push(um);
              }
              
              this.apiConn.GetUserImage(user.id).subscribe(blob => {
                const url = window.URL.createObjectURL(blob);   
                Array.prototype.forEach.call(document.getElementsByClassName(user.username), 
                  item => item.setAttribute("src",url));
                Array.prototype.forEach.call(document.getElementsByClassName(user.username), 
                  item => item.setAttribute("class",user.username + " is-rounded"));
              });
            }
          });
        });


      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });

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
  
