import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SpinnerService } from '../../services/spinner.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { BarcodeFormat, BarcodeScanner, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { Platform } from '@ionic/angular';
import { User } from 'src/app/models/user.model';


@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.page.html',
  styleUrls: ['./register-admin.page.scss'],
})
export class RegisterAdminPage implements OnInit {
  user: any;
  type: string = 'password';
  isPassword!: boolean;
  hide: boolean = false;
  scanActive: boolean = false;
  content: string[];
  pressedButton: boolean = false;
  scanResult: string;
  scannedDni: string;

  ngOnInit(): void {
    if (this.type == 'password') this.isPassword = true;
    this.pressedButton = false;

    if (this.platform.is('capacitor')) {
      //solicitando permisos
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners().then();
    } else {
      console.log('No es una plataforma de android');
    }
  }

  constructor(
    private authServicio: AuthService,
    private spinnerServicio: SpinnerService,
    private takeFoto: UtilsService,
    private router: Router,
    private platform: Platform
  ) {}

  irMenu() {
    this.router.navigate(['menu']);
  }

  async cerrarSesion() {
    const resultado = await this.authServicio.cerrarSesion();
    if (resultado) {
      this.router.navigate(['/login']);
    } else {
      //mensaje
      this.spinnerServicio.mostrarMensaje({
        message: 'Uuuup! Ocurrio un error en cerrar la sesión.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }

  formRegistro = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z]+$'),
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z]+$'),
    ]),
    dni: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{8}$'),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(10),
    ]),
    passwordRep: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(10),
    ]),
    perfilImagen: new FormControl('', [Validators.required]),
  });

  //--------TOMAR/SELECCIONAR UNA FOTO----------
  async tomarFoto() {
    const dataUrl = (await this.takeFoto.takePicture('Imagen de perfil'))
      .dataUrl;
    this.formRegistro.controls.perfilImagen.setValue(dataUrl);
  }

  mostrarOcultarPassword() {
    this.hide = !this.hide;
    if (this.hide) this.type = 'password';
    else this.type = 'text';
  }

  get getEmail() {
    return this.formRegistro.get('email');
  }

  get getPassword() {
    return this.formRegistro.get('password');
  }

  get getPasswordRep() {
    return this.formRegistro.get('passwordRep');
  }

  get getNombre() {
    return this.formRegistro.get('nombre');
  }

  get getApellido() {
    return this.formRegistro.get('apellido');
  }

  get getImagenPerfil() {
    return this.formRegistro.get('perfilImagen');
  }

  get getDni() {
    return this.formRegistro.get('dni');
  }

  async registro() {
    const loading = await this.spinnerServicio.loading();
    loading.present();
    try  {

      if (!this.formRegistro.value.perfilImagen) {
        this.spinnerServicio.mostrarMensaje({
          message: 'Debes seleccionar una foto de perfil',
          duration: 2500,
          color: 'danger',
          position: 'middle',
        });
        loading.dismiss();
        return;
      }

      if(!this.camposSonValidos()) return;

      // const { nombre, apellido, dni, email, password } =
      //   this.formRegistro.value;
      // const user = { nombre, apellido, dni, email, password, perfil: 'Otro' };
           var usuario: User = {
             email: this.getEmail?.value,
             password: this.getPassword?.value,
             dni:  parseInt(this.getDni?.value),
             nombre: this.getNombre?.value,
             apellido: this.getApellido?.value,
             perfil: 'Otro',
           };
      //this.pressedButton = true;
      this.authServicio
        .register(usuario.email, usuario.password, usuario.nombre)
        .then(async (userCredential) => {
          //usuario
          const uid = userCredential.user.uid;
          //subir iamgen y obtener url
          let dataUrl = this.formRegistro.value.perfilImagen;
          let imagenPath = `fotos/${uid}`; //path del storage - guardo en mi collecion fotos del storage con el uid del usuario
          let imageUrl = await this.authServicio.uploadImagen(
            imagenPath,
            dataUrl
          );
          this.formRegistro.controls.perfilImagen.setValue(imageUrl); //Tenemos la url de la imagen y la guardamos en el formRegistro
          //elimino el password para que se no se guarde
          delete this.formRegistro.value.passwordRep;
          delete this.formRegistro.value.password;
          //guardamos en firestore a mi usuario creado con todos sus datos
          let path = `usuarios/${uid}/`;
          this.authServicio
            .guardarDocumento(path, {
              ...this.formRegistro.value, // Use object destructuring
              perfil: 'Otro',
            })
            .then(async (res) => {
              this.formRegistro.reset();
              //mensaje
              this.spinnerServicio.mostrarMensaje({
                message: `Se creo el usuario ${usuario.nombre} exitosamente`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'ckeckmark-circle-outline',
              });
            });
        })
        .catch((error) => {
          //mensaje
          this.spinnerServicio.mostrarMensaje({
            message: `${this.authServicio.createMensaje(error.code)}`,
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
          this.formRegistro.reset();
        })
        .finally(() => loading.dismiss());
      //this.pressedButton = false;
    } catch {
      loading.dismiss();
      this.spinnerServicio.mostrarMensaje({
        message: 'Debe completar el formualario con sus datos',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }

  //SCANNER
  async startScanner() {
    try {
      BarcodeScanner.installGoogleBarcodeScannerModule();
      this.scanActive = true;
      //Configuro el escaneador para que que solo reconozca codigos qr
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        this.spinnerServicio.toast(
          'No se han otorgado los permisos para acceder a la cámara',
          'danger'
        );
        return;
      }

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Pdf417], // Solo apunta a documentos de identidad
      }); // Add type assertion to specify 'targetedFormats' property
      console.log(result);

      if (result.barcodes.length === 0) {
        this.spinnerServicio.toast(
          'No se ha podido leer el código de barras',
          'danger'
        );
        return;
      }

      const datosDni = result.barcodes[0].displayValue;

      console.log('Datos' + datosDni);
      //DNI Viejo:@29637515    @A@1@GALLO@ALEJANDRO JUVENAL@ARGENTINA@31/07/1982@M@23/06/2011@00056192695@7006 @23/06/2026@264@0@ILR:2.01 C:110613.02 (No Cap.)@UNIDAD #20 || S/N: 0040>2008>>00??

      const dni = datosDni.split('@');

      if (dni.length == 8 || dni.length == 9) {
        
        this.formRegistro.patchValue({ apellido: this.capitalizeFirstLetter(dni[1]) });
        this.formRegistro.patchValue({ nombre: this.capitalizeFirstLetter(dni[2]) });
        this.formRegistro.patchValue({ dni: dni[4] });
      } else {
        this.formRegistro.patchValue({ apellido: this.capitalizeFirstLetter(dni[4]) });
        this.formRegistro.patchValue({ nombre: this.capitalizeFirstLetter(dni[5]) });
        this.formRegistro.patchValue({ dni: dni[1].trim() });
      }
    } catch (error) {
      this.spinnerServicio.toast(
        'Uuups! Ocurio un error en escanear...',
        'danger'
      );
    } finally {
      this.scanActive = false;
    }
  }
  // end of startScan

  async stopScan() {
    this.scanActive = false;
    // Stop the barcode scanner
    await BarcodeScanner.stopScan();
  } // end of stopScan

  camposSonValidos(): boolean {
    //validar nombre
    if (this.getNombre?.value === '') {
      this.spinnerServicio.toast('Ingrese un nombre válido','danger');
      return false;
    }
    //validar apellido
    if (this.getApellido?.value === '') {
      this.spinnerServicio.toast('Ingrese un apellido válido', 'danger');
      return false;
    }
    //validar dni
    if (
      (this.getDni?.value === '' ||
        this.getDni?.value.length < 7 ||
        this.getDni?.value.length > 9)
    ) {
      this.spinnerServicio.toast('Ingrese un DNI válido', 'danger');
      return false;
    }
   
    //validar password
    if (
      (this.getPassword?.value === '' || this.getPassword?.value.length < 6)
    ) {
      this.spinnerServicio.toast('Ingrese una contraseña válida', 'danger');
      return false;
    }

    return true;
  }

  capitalizeFirstLetter(str: string): string {
    // Separa el nombre en palabras individuales
    const words = str.split(' ');

    // Capitaliza la primera letra de cada palabra
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    // Une las palabras nuevamente
    return capitalizedWords.join(' ');
  }

}
