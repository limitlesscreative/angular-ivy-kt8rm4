import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AnimShiftingTextComponent } from './components/anim-shifting-text/anim-shifting-text.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import gsap from 'gsap';
import { LiquidContainerComponent } from './components/liquid-container/liquid-container.component';
import { PixiContainerComponent } from './components/pixi-container/pixi-container.component';

gsap.registerPlugin(CustomEase);

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    AnimShiftingTextComponent,
    SidebarComponent,
    LiquidContainerComponent,
    PixiContainerComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
