import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splah-animado',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'menu',
    loadChildren: () =>
      import('./pages/menu/menu.module').then((m) => m.MenuPageModule),
  },
  {
    path: 'register-admin',
    loadChildren: () =>
      import('./pages/register-admin/register-admin.module').then(
        (m) => m.RegisterAdminPageModule
      ),
  },
  {
    path: 'splah-animado',
    loadChildren: () =>
      import('./pages/splah-animado/splah-animado.module').then(
        (m) => m.SplahAnimadoPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
