import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollableDirective } from './scrollable.directive';

describe('ScrollbarDirective', () => {
  let component: ScrollableDirective;
  let fixture: ComponentFixture<ScrollableDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollableDirective ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollableDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
