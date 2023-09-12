import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvoHistoryComponent } from './convo-history.component';

describe('ConvoHistoryComponent', () => {
  let component: ConvoHistoryComponent;
  let fixture: ComponentFixture<ConvoHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConvoHistoryComponent]
    });
    fixture = TestBed.createComponent(ConvoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
