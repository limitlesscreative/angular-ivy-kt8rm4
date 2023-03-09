import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import gsap from 'gsap';
import { Power2SmoothEase } from '../../ease-functions/power2-smooth.ease';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit, AfterContentInit {
  @ViewChild('Wrapper') wrapperEl: ElementRef<HTMLElement>;
  @ViewChild('Items') itemsEl: ElementRef<HTMLElement>;
  @ViewChild('Content') contentEl: ElementRef<HTMLElement>;
  @ViewChild('Handle') handleEl: ElementRef<HTMLElement>;
  @ViewChild('Backdrop') backdropEl: ElementRef<HTMLElement>;

  WRAPPER_EL_INITIAL = {
    transformOrigin: 'left',
    scaleY: 0.2,
    scaleX: 0.2,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
    x: -55,
    duration: 0.1,
  };
  ITEMS_EL_INITIAL = {
    x: -700,
    duration: 0.1,
    opacity: 0,
    scaleX: 3.4,
  };
  CONTENTS_EL_INITIAL = {
    x: '+=-200',
    duration: 0.1,
  };
  HANDLE_EL_INITIAL = {
    opacity: 0.5,
    letterSpacing: 3.2,
  };

  isOpening = false;
  isClosing = false;
  isOpened = false;
  currentAnimation?: gsap.core.Timeline;

  ngAfterViewInit() {
    this.setInitialState();
  }
  ngAfterContentInit() {}

  onMouseEnter() {
    if (this.currentAnimation?.reversed()) {
      this.currentAnimation.play();
      return;
    }
    if (this.isOpening || (this.isOpened && this.isClosing)) {
      return;
    }
    this.isOpening = true;
    this.currentAnimation = this.getEnterAnimation();
    this.currentAnimation
      .play()
      .eventCallback('onComplete', () => {
        this.isOpening = false;
        this.isClosing = false;
        this.isOpened = true;
      })
      .eventCallback('onReverseComplete', () => {
        this.currentAnimation.play();
        this.currentAnimation.kill();
        this.isOpening = false;
        this.isClosing = false;
        this.isOpened = false;
      });
  }
  onMouseLeave() {
    if (
      !this.currentAnimation.reversed() &&
      this.isOpening &&
      this.currentAnimation.progress() < 0.3
    ) {
      this.currentAnimation.reverse();
      return;
    }
    if (
      this.isClosing ||
      this.wrapperEl.nativeElement.getBoundingClientRect().x < -54
    ) {
      return;
    }
    this.currentAnimation.pause();
    this.isClosing = true;
    this.currentAnimation = this.getLeaveAnimation();
    this.currentAnimation.play().eventCallback('onComplete', () => {
      this.isOpening = false;
      this.isClosing = false;
      this.isOpened = false;
      this.setInitialState();
    });
  }

  private setInitialState() {
    gsap.set(this.wrapperEl.nativeElement, this.WRAPPER_EL_INITIAL);
    gsap.set(this.getItemsElements(), this.ITEMS_EL_INITIAL);
    gsap.set(this.getContentElements(), this.CONTENTS_EL_INITIAL);
    gsap.set(this.handleEl.nativeElement, this.HANDLE_EL_INITIAL);
  }

  private getEnterAnimation = () => {
    const timeline = gsap.timeline();

    timeline.to(this.handleEl.nativeElement, {
      opacity: 0,
      ease: 'power3.inOut',
      duration: 0.43,
      letterSpacing: 20,
      autoRound: false,
    });
    timeline.to(
      this.wrapperEl.nativeElement,
      {
        scaleY: 1,
        ease: 'power4.inOut',
        duration: 0.43,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      '<'
    );
    timeline.to(
      this.backdropEl.nativeElement,
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.inOut',
      },
      '<0.23'
    );
    timeline.to(
      this.wrapperEl.nativeElement,
      {
        scaleX: 1,
        ease: 'power2.inOut',
        x: 0,
        duration: 0.5,
      },
      '<0.09'
    );
    timeline.to(
      this.getItemsElements(),
      {
        x: 0,
        ease: 'power3.out',
        duration: 1.07,
        stagger: 0.19,
      },
      '<'
    );
    timeline.to(
      this.getItemsElements(),
      {
        scaleX: 1,
        ease: 'expo.out',
        duration: 1.1,
      },
      '<'
    );
    timeline.to(
      this.getItemsElements(),
      {
        opacity: 1,
        duration: 1,
      },
      '<'
    );
    timeline.to(
      this.getContentElements(),
      {
        x: 0,
        ease: 'expo.out',
        duration: 1.05,
        stagger: 0.1,
      },
      '<0.3'
    );

    return timeline;
  };

  private getLeaveAnimation = () => {
    const timeline = gsap.timeline();

    timeline.to(this.wrapperEl.nativeElement, {
      x: -400,
      ease: 'power2.inOut',
      duration: 0.51,
    });
    timeline.to(
      this.backdropEl.nativeElement,
      {
        opacity: 0,
        duration: 0.5,
        ease: 'power1.inOut',
      },
      '<'
    );
    timeline.set(this.getItemsElements(), {
      ...this.ITEMS_EL_INITIAL,
      opacity: 0,
      duration: 0,
      stagger: 0,
    });
    timeline.set(this.wrapperEl.nativeElement, {
      ...this.WRAPPER_EL_INITIAL,
      x: -600,
      duration: 0,
    });
    timeline.set(this.getContentElements(), {
      ...this.CONTENTS_EL_INITIAL,
      duration: 0,
    });
    timeline.set(this.handleEl.nativeElement, {
      ...this.HANDLE_EL_INITIAL,
      x: -100,
    });
    timeline.to(
      this.wrapperEl.nativeElement,
      {
        x: -55,
        ease: 'power2.out',
        duration: 0.3,
      },
      '<'
    );
    timeline.to(
      this.handleEl.nativeElement,
      {
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      },
      '<'
    );

    return timeline;
  };

  private getContentElements() {
    return this.contentEl.nativeElement.children;
  }
  private getItemsElements() {
    return this.itemsEl.nativeElement.children;
  }
}
