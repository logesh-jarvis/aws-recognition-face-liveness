import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivenessService {
  public liveness_session: BehaviorSubject<[string, {}]> = new BehaviorSubject<[string, {}]>(['empty', {}]);

  async get_current_session() {
  }

  // Modify to get face liveness session
  async get_face_liveness_session() {
    // var rekognition = new AWS.Rekognition();
    // rekognition.createFaceLivenessSession({}, (err, data) => {
    //   if (err)
    //     console.log(err, err.stack);
    //   else {
    //     this.liveness_session.next(['success', data]);
    //   }
    // });
  }
}
