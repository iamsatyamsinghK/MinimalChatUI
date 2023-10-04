import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSendMessageComponent } from './group-send-message.component';

describe('GroupSendMessageComponent', () => {
  let component: GroupSendMessageComponent;
  let fixture: ComponentFixture<GroupSendMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupSendMessageComponent]
    });
    fixture = TestBed.createComponent(GroupSendMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
