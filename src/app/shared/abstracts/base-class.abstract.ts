import { Subscription } from 'rxjs';

export class BaseClass {
  private subscriptions$: Subscription[] = [];
  protected registerSubscriptions(registerSubscriptions: Subscription[]): void {
    this.subscriptions$ = [...this.subscriptions$, ...registerSubscriptions];
  }

  protected unsubscribeSubscriptions(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
    this.subscriptions$ = [];
  }
}
