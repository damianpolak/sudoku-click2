import { FirstUpperPipe } from './first-upper.pipe';

describe('FirstUpperPipe', () => {
  it('create an instance', () => {
    const pipe = new FirstUpperPipe();
    expect(pipe).toBeTruthy();
  });
});
