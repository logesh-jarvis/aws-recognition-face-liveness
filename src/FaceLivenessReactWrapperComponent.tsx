import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import * as AWS from 'aws-sdk';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client'; // Use ReactDOM from 'react-dom/client' for React 18

const containerElementName = 'faceLivenessReactContainer';

@Component({
    selector: 'app-faceliveness-react-wrapper',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['./FaceLivenessAmplify.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class FaceLivenessReactWrapperComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: true }) containerRef!: ElementRef;

    @Input() public counter = 10;
    @Input() public sessionId = null;
    @Output() public livenessResults = new EventEmitter<any>();
    @Output() public livenessErrors = new EventEmitter<any>();
    region = 'us-east-1';
    private root: any; // To store the root object

    constructor() {
    }

    ngOnInit(): void {
        console.log('Component Loaded' + this.sessionId)
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.render();
    }

    ngAfterViewInit() {
        this.render();
    }

    ngOnDestroy() {
        if (this.root) {
            this.root.unmount(); // Unmount the component using the new API
        }
    }

    handleAnalysisComplete = async () => {
        var rekognition = new AWS.Rekognition();
        var params = {
            SessionId: this.sessionId
        };
        rekognition.getFaceLivenessSessionResults(params).promise().then(data => {
            this.livenessResults.emit(data);
            console.log(data);
        }).catch(err => {
            console.log(err);
        });
    }

    handleError = async (err: any) => {
        console.log(err)
        this.livenessErrors.emit(err);
    }

    private render() {
        // Use createRoot for React 18
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.containerRef.nativeElement); // Create the root object once
        }

        console.log(AWS.config.credentials)
        
        this.root.render(
            <React.StrictMode>
                <div>
                    <FaceLivenessDetector
                        sessionId={this.sessionId} 
                        region={this.region} 
                        onAnalysisComplete={this.handleAnalysisComplete}
                        config={{
                            credentialProvider: () => { return AWS.config.credentials }
                        } as any }
                        onError={this.handleError}
                    />
                </div>
            </React.StrictMode>
        );
    }
}
