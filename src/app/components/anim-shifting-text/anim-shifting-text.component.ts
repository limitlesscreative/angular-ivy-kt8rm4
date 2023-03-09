import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import gsap from 'gsap';
import { BounceEase } from '../../ease-functions/bounce.ease';
import { Power2SmoothEase } from '../../ease-functions/power2-smooth.ease';

@Component({
  selector: 'anim-shifting-text',
  templateUrl: './anim-shifting-text.component.html',
  styleUrls: ['./anim-shifting-text.component.scss'],
})
export class AnimShiftingTextComponent implements OnInit, AfterViewInit {
  @ViewChild('Text') textEl: ElementRef<HTMLElement>;
  @ViewChild('Bullet') bulletEl: ElementRef<HTMLElement>;

  @Input() text = 'Text';

  TEXT_EL_INITIAL = {
    opacity: 0.8,
  };
  BULLET_EL_INITIAL = {
    scale: 0,
    left: 12,
    top: 0,
    y: 0,
    x: 0,
    opacity: 0.6,
    borderRadius: 25,
    rotate: 0,
  };

  currentAnimation?: gsap.core.Timeline;

  ngOnInit() {}
  ngAfterViewInit() {
    this.setAnimationInitialState();
  }

  onTextMouseEnter() {
    this.currentAnimation?.pause();
    this.currentAnimation = this.getEnterAnimation();
    this.currentAnimation.play();
  }
  onTextMouseLeave() {
    const progress = this.currentAnimation.progress();
    this.currentAnimation.pause();

    this.currentAnimation = this.getLeaveAnimation(progress);
    this.currentAnimation.play();
  }

  private setAnimationInitialState() {
    gsap.set(this.bulletEl.nativeElement, this.BULLET_EL_INITIAL);
    gsap.set(this.textEl.nativeElement, this.TEXT_EL_INITIAL);
  }

  private getEnterAnimation = () => {
    const timeline = gsap.timeline({ paused: true });

    this.setAnimationInitialState();

    timeline.to(this.textEl.nativeElement, {
      opacity: 1,
      duration: 0.15,
      ease: 'power1.inOut',
    });
    timeline.to(
      this.textEl.nativeElement,
      {
        paddingLeft: 35,
        duration: 0.35,
        ease: Power2SmoothEase,
      },
      '<'
    );
    timeline.to(
      this.bulletEl.nativeElement,
      {
        keyframes: [
          {
            scaleX: 1,
            scaleY: 1,
            duration: 0.03,
            ease: 'power2.inOut',
            opacity: 0.2,
            borderRadius: 16,
          },
          {
            scaleX: 0.5,
            scaleY: 2.89,
            duration: 0.03,
            ease: 'power2.inOut',
            y: 3,
          },
          {
            scaleX: 1,
            scaleY: 1,
            ease: BounceEase,
            y: 12,
            duration: 0.8,
            opacity: 1,
            borderRadius: 1,
          },
        ],
      },
      '<0.13'
    );
    timeline.to(
      this.bulletEl.nativeElement,
      {
        rotate: 45,
        ease: 'elastic.out',
        duration: 2,
      },
      '<0.23'
    );
    return timeline;
  };

  private getLeaveAnimation = (enteringProgress?: number) => {
    const timeline = gsap.timeline({ paused: true });

    const MAX_DURATION = 0.55;
    let duration =
      enteringProgress > MAX_DURATION ? MAX_DURATION : enteringProgress * 1.5;
    duration = duration > MAX_DURATION ? MAX_DURATION : duration;

    const bulletScaleX =
      this.bulletEl.nativeElement.getBoundingClientRect().width /
      this.bulletEl.nativeElement.offsetWidth;

    if (bulletScaleX > 0.5) {
      timeline.to(
        this.bulletEl.nativeElement,
        {
          scaleX: 1,
          scaleY: 1,
          y: 12,
          duration: 0.17,
        },
        '<'
      );
    } else {
      timeline.to(
        this.bulletEl.nativeElement,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.05,
          opacity: 0,
          y: 12,
        },
        '<'
      );
    }

    timeline.to(
      this.textEl.nativeElement,
      {
        ...this.TEXT_EL_INITIAL,
        paddingLeft: 0,
        ease: 'power1.inOut',
        duration: duration,
      },
      '<'
    );
    timeline.to(
      this.bulletEl.nativeElement,
      {
        opacity: 0,
        x: -30,
        duration: duration,
        ease: 'power1.inOut',
      },
      '<'
    );
    return timeline;
  };
}
