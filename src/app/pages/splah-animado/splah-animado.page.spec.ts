import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplahAnimadoPage } from './splah-animado.page';

describe('SplahAnimadoPage', () => {
  let component: SplahAnimadoPage;
  let fixture: ComponentFixture<SplahAnimadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplahAnimadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
