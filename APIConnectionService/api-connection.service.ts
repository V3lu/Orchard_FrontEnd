import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Host, Injectable } from '@angular/core';
import { User } from '../Models/user';
import { TokenContainerService } from '../AuthGuardService/token-container.service';

@Injectable({
  providedIn: 'root'
})
export class APIConnectionService {

  constructor(private http: HttpClient, private TC: TokenContainerService) { }

  loginControllerUrl = 'https://localhost:7023/api/Login';
  SystemCleaningControllerUrl = 'https://localhost:7023/api/SystemCleaning';
  RegisterControllerUrl = 'https://localhost:7023/api/Register';
  NotificationsControllerUrl = 'https://localhost:7023/api/Notifications';
  NotificationsControllerDeleteNotificationUrl = 'https://localhost:7023/api/Notifications/DeleteNotification';
  UsersUpdateDataControllerUrl = 'https://localhost:7023/api/Users/updatedata';
  UsersGetIamgeControllerUrl = 'https://localhost:7023/api/Users/getuserphoto';
  UsersSendNotificationWhenProfileVisitedUrl = 'https://localhost:7023/api/Users/addnotificationwhenprofilevisited';
  UsersGetUserByIdUrl = 'https://localhost:7023/api/Users/getuserbyid';
  UsersGetSearchedUsersWithFilters = 'https://localhost:7023/api/Users/getuserssearchedforwithfilters';
  MessagesGetAllForUser = 'https://localhost:7023/api/Messages/GetAllUserMessagess';
  MessagesPermitMessageSend = 'https://localhost:7023/api/Messages/permitmessagesend';
  MessagesGetAllForUserWithFilter = 'https://localhost:7023/api/Messages/GetAllUserMessagessWithFilter';
  MessagesSendUserMessage = 'https://localhost:7023/api/Messages/reciveMessageSendByUserToUser';
  UsersCheckIfUsernameExists = 'https://localhost:7023/api/Users/checkifusernameexists';
  UsersCheckIfEmailExists = 'https://localhost:7023/api/Users/checkifemailexists';
  MessagesGetLast5UserMessages = 'https://localhost:7023/api/Messages/GetLast5UserMessages';
  PaymentsCheck = 'https://localhost:7023/api/Payments/paymentcheck';
  PaymentsStoretxhash = 'https://localhost:7023/api/Payments/storetxhash';
  PaymentsGettxhash = 'https://localhost:7023/api/Payments/gettxhash';

  PermitMesssageSend(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.MessagesPermitMessageSend, {Id}, {observe: 'response', headers: headers })
  }

  GetUserById(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersGetUserByIdUrl, {Id}, {observe: 'response', headers: headers })
  }

  PaymentGettxhash(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.PaymentsGettxhash, {Id}, {observe: 'response', headers: headers })
  }

  PaymentStoretxhash(Id : any, City : string){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.PaymentsStoretxhash, {Id, City}, {observe: 'response', headers: headers })
  }

  PaymentsChecking(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.PaymentsCheck, {Id}, {observe: 'response', headers: headers })
  }

  SendNotoficationWhenProfileVisited(VisitorId : any, HostId : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersSendNotificationWhenProfileVisitedUrl, {VisitorId, HostId}, {observe: 'response', headers: headers })
  }

  cleanExcessNotifications(){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.SystemCleaningControllerUrl, {}, {observe: 'response', headers: headers })
  }

  login(email:string, password:string ) {
    return this.http.post<any>(this.loginControllerUrl, {email, password}, {observe: 'response'})
  }

  register(username:string, password:string, email:string, age:string, city:string, region:string, sex:string){
    return this.http.post<any>(this.RegisterControllerUrl, {username, password, email, age, city, region, sex})
  }

  getNotificationsFrom3Months(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.NotificationsControllerUrl, {Id}, {observe: 'response', headers: headers })
  }

  GetUsersSearchedForWithFilters(formdata: FormData){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersGetSearchedUsersWithFilters, formdata, {observe: 'response', headers: headers })
  }

  DeleteNotification(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.NotificationsControllerDeleteNotificationUrl, {Id}, {observe: 'response', headers: headers })
  }

  GetUserImage(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(this.UsersGetIamgeControllerUrl, {Id}, {headers: headers, responseType: 'blob' })
  }

  GetAllUserMessagesWithFilter(formdata: FormData){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.MessagesGetAllForUserWithFilter, formdata, {observe: 'response', headers: headers })
  }

  GetAllUserMessages(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.MessagesGetAllForUser, {Id}, {observe: 'response', headers: headers })
  }

  GetLast5UserMessagess(Id : any){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.MessagesGetLast5UserMessages, {Id}, {observe: 'response', headers: headers })
  }

  SendUserMessage(formdata: FormData){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.MessagesSendUserMessage, formdata, {observe: 'response', headers: headers })
  }

  UpdateUserData(formdata: FormData){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersUpdateDataControllerUrl, formdata, {observe: 'response', headers: headers })
  }

  CheckIfEmailExists(email : string){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersCheckIfEmailExists, {email}, {observe: 'response', headers: headers })
  }

  CheckIfUsernameExists(username : string){
    const token = this.TC.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.UsersCheckIfUsernameExists, {username}, {observe: 'response', headers: headers })
  }
}
