import { expect } from 'chai';

describe('main', () => {
  it('must succeed', () => {
    expect(2 + 2, '2 + 2').to.eq(4, '= 4');
  });
  it('must succeed', () => {
    expect(3 + 3, '3 + 3').to.eq(6, '= 6');
  });
});
