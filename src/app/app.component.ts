import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'aws-rekognition-liveness-detection-angular';
  load_face_live = false;
  
  ngOnInit(): void {
    this.load_face_live = true;
    console.log('component-loaded')
  }
 
}
