import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LivenessService } from './liveness.service';
import * as AWS from 'aws-sdk';
import { FaceLivenessReactWrapperComponent } from 'src/FaceLivenessReactWrapperComponent';
import * as CryptoJS from 'crypto-js';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../service';

@Component({
  selector: 'app-face-liveness',
  templateUrl: './face-liveness.component.html',
  styleUrls: ['./face-liveness.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FaceLivenessComponent implements OnInit {

  public counter = 21;

  start_liveness_session = false;
  liveness_session_complete = false;
  session_id = null;
  is_live = false;
  confidence = 0;
  face_live_message = 'Loading ...'

  @ViewChild('faceliveness', { static: false }) faceliveness: FaceLivenessReactWrapperComponent;

  constructor(private faceLivenessService: LivenessService, private dataService: DataService) {

  }

  ngOnInit(): void {
    this.initiate();
  }

  public async initiate() {
    try {
      const jwt = this.getJwtFromLocalStorage();
      const token = await this.getDecryptedToken(jwt.user_id);
      await this.configureAWS(token);
      this.dataService.createLivenessSession().subscribe(async (res: any) => {
        console.log('sessionCreated')
        this.session_id = res.SessionId;
        this.initate_liveness_session({});
      });
    } catch (error) {
      console.error('Error during initiation:', error);
    }
  }

  private async getDecryptedToken(userId: string): Promise<any> {
    const encryptedToken = await firstValueFrom(this.dataService.getToken());
    const decryptedData = CryptoJS.AES.decrypt(JSON.parse(encryptedToken).data, userId).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }

  private async configureAWS(token: any): Promise<void> {
    AWS.config.correctClockSkew = true;
    AWS.config.region = 'us-east-1';
    console.log(token.c.IdentityPoolId);
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: token.c.IdentityPoolId,
      IdentityId: token.c.IdentityId,
      Logins: {
        'cognito-identity.amazonaws.com': token.c.Token,
      },
    });

    await new Promise<void>((resolve, reject) => {
      AWS.config.getCredentials((err: any) => {
        if (err) {
          console.error('Error obtaining AWS credentials:', err);
          reject(err);
        } else {
          console.log('AWS credentials obtained successfully');
          resolve();
        }
      });
    });
  }

  private getJwtFromLocalStorage(): any {
    return JSON.parse(localStorage.getItem('token') ?? '{}');
  }

  public handleErrors(err: any) {
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    this.face_live_message = 'Error  during liveness detection'
    this.is_live = false;
    // Force remove the ReactDOM
    this.faceliveness.ngOnDestroy();
  }

  public handleLivenessAnalysisResults(data: any) {
    console.log(data);
    if (data['Confidence'] > 80) {
      this.is_live = true;
      this.face_live_message = `Liveness check passed, Confidence ${Math.round(Number(data['Confidence']))}`
    } else {
      this.is_live = false;
      this.face_live_message = `Liveness check failed, Confidence ${Math.round(Number(data['Confidence']))}`
    }
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    // Force remove the ReactDOM
    this.faceliveness.ngOnDestroy();
  }

  initate_liveness_session(data: {}) {
    this.is_live = false;
    this.confidence = 0;
    this.liveness_session_complete = false;
    setTimeout(() => {
      console.log("UI Initiating")
      this.start_liveness_session = true;
    }, 4);
  }

  get_liveness_session() {
    this.start_liveness_session = false;
    this.faceLivenessService.get_face_liveness_session();
  }

}
