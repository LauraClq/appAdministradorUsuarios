import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplahAnimadoPageRoutingModule } from './splah-animado-routing.module';

import { SplahAnimadoPage } from './splah-animado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplahAnimadoPageRoutingModule
  ],
  declarations: [SplahAnimadoPage]
})
export class SplahAnimadoPageModule {}
