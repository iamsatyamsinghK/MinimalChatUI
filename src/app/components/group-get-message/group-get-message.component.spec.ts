import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupGetMessageComponent } from './group-get-message.component';

describe('GroupGetMessageComponent', () => {
  let component: GroupGetMessageComponent;
  let fixture: ComponentFixture<GroupGetMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupGetMessageComponent]
    });
    fixture = TestBed.createComponent(GroupGetMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
