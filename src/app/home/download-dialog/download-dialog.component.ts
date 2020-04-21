import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SaveUserService } from 'src/app/shared/save-user.service';
import { DialogData, User } from 'src/app/models/users';
import { EmailValidationService } from 'src/app/shared/email-validation.service';
import { DownloadPdfService } from 'src/app/shared/download-pdf.service';
import * as FileSaver from 'file-saver';
import { SendMailService } from 'src/app/shared/send-mail.service';
import * as firebase from 'firebase/app';
import 'firebase/storage';


@Component({
  selector: 'app-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.css']
})
export class DownloadDialogComponent implements OnInit {

  name = '';
  emailExists = false;
  user: User[] = [];
  downloadForm: FormGroup;
  pdfUrl: string;
  constructor(public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private save: SaveUserService,
    private emailValidation: EmailValidationService,
    private _snackBar: MatSnackBar, private sendMailService: SendMailService) { }

  ngOnInit() {
    this.downloadForm = new FormGroup({
      userName: new FormControl(null, Validators.required),
      userEmail: new FormControl(null, Validators.required)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    console.log(this.downloadForm.value);
    this.user.push(this.downloadForm.value);
    console.log(this.user);
    this.save.storeUser(this.user)
      .subscribe(
        (response) => console.log(response),
        (error) => console.log(error)
      );
    this.emailValidation.verifyEmail(this.downloadForm.value.userEmail)
      .subscribe(
        (response: any) => {
          this.emailExists = response.smtp_check;
          if (!this.emailExists) {
            this.openSnackBar({ message: 'EMAIL NOT VALID!', action: 'OK', duration: 3000 });
          } else {
            // this.downloadFile();
            this.openPdf();
            // this.sendMail();
          }
        },
        (error) => console.log(error)
      );
    this.dialogRef.close();
  }

  openSnackBar(event) {
    this._snackBar.open(event.message, event.action, {
      duration: event.duration,
    });
  }
  // Downloading File
  // downloadFile() {
  //   this.downloadService.downloadPdf(this.pdfUrl).subscribe(
  //     (res) => {
  //       FileSaver.saveAs(res, 'Vinay_Pathak_Resume.pdf');
  //     }
  //   );
  // }

  openPdf() {
    const storageRef = firebase.storage().ref();
    // this.ref = this.afStorage.ref('Vinay_Pathak_Resume.pdf');
    const pdfRef = storageRef.child('Vinay_Pathak_Resume.pdf');
    pdfRef.getDownloadURL().then(function (url) {
      // Insert url into an <img> tag to "download"
      const openedWindow = window.open(url);
      // openedWindow.document.write("<h3> Thank you for downloading </h3>");
    }).catch(function (error) {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
          break;
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;
        case 'storage/unknown':
          // Unknown error occurred, inspect the server response
          break;
      }
    });
  }
  sendMail() {
    this.sendMailService.send(this.downloadForm.value)
      .subscribe(
        (response) => console.log('mail sent'),
        (error) => console.log(error)
      );
  }
}
