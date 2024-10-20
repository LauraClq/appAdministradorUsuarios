import { inject, Injectable } from '@angular/core';
import {
  LoadingController,
  ToastController,
  ToastOptions,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  spinner = inject(LoadingController);
  spinnerMensaje = inject(ToastController);
  constructor() {}

  loading() {
    return this.spinner.create({ spinner: 'circular' });
  }

  //Generar mensaje
  async mostrarMensaje(opts: ToastOptions) {
    const toast = await this.spinnerMensaje.create(opts);
    toast.present();
  }

  async toast(message, status) {
    try {
      const toast = await this.spinnerMensaje.create({
        message: message,
        color: status,
        position: 'top',
        duration: 2000,
      });
      toast.present();
    } catch (error) {
      console.log(error.message);
    }
  } // end of toast
}
