import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplahAnimadoPage } from './splah-animado.page';

const routes: Routes = [
  {
    path: '',
    component: SplahAnimadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplahAnimadoPageRoutingModule {}
