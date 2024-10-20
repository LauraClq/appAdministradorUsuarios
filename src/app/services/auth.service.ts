import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { updateProfile, sendEmailVerification, getAuth } from '@angular/fire/auth';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  collectionData,
  collection,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { uploadString, getStorage, ref, getDownloadURL } from 'firebase/storage';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;
  
  constructor(
    private auth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private spinner: SpinnerService
  ) {
    this.user$ = this.auth.authState;
  }

  //-----------Authentication---------------

  async signIn(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  //-----------Register------------------------
  async register(email: string, password: string, nombre?: string) {
    const usuario = this.auth.createUserWithEmailAndPassword(email, password);
    const user = (await usuario).user;

    //Actualizar el nombre del usuario
    await updateProfile(user, { displayName: nombre });

    // //Guardar datos en Firestores
    this.sendEmailVerification(getAuth(), email)
             .then(() => {
               this.spinner.toast(
                 'Se envió un email de verificarion exitosamente',
                 'success'
               );
             });
    return usuario;
  }

  async sendEmailVerification(authe, email) {
    return await sendEmailVerification(authe, email);
  }
  //---------LOCALSTORAGE---------

  guardarLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  obtenerLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  //-----------FIRESTORE--------------------

  async guardarDocumento(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async obtenerDocumento(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  //otra forma
  obtenerCollection(paht: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), paht);
    const orderedRef = query(ref, orderBy('nombre', 'asc'));
    return collectionData(orderedRef, { idField: 'id' }); //me retorna con su id
  }

  //Cerrar Sesion de usuario
  async cerrarSesion() {
    try {
      localStorage.removeItem('usuario');
      await this.auth.signOut();
      return true;
    } catch {
      return false;
    }
  }

  //---------------SUBIR IMAGEN--------
  async uploadImagen(paht: string, data: string) {
    return uploadString(ref(getStorage(), paht), data, 'data_url').then(() => {
      return getDownloadURL(ref(getStorage(), paht));
    });
  }

  createMensaje(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos estan vacios';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es valido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'No existe ningún usuario con estos identificadores';
        break;
      default:
        message = 'Dirección de email y/o contraseña incorrectos';
        break;
    }

    return message;
  } // end of createMessage
}
