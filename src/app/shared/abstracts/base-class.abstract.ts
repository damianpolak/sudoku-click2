import { Subscription } from 'rxjs';

export abstract class BaseClass {
  private subscriptions$: Subscription[] = [];
  protected registerSubscriptions(registerSubscriptions: Subscription[]): void {
    this.subscriptions$ = [...this.subscriptions$, ...registerSubscriptions];
  }

  protected unsubscribeSubscriptions(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
    this.subscriptions$ = [];
  }
}
