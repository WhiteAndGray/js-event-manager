import {Example} from '../../src/example';

describe('Example', () => {

  it('foo() returns "bar"', () => {

    expect(new Example().foo()).toEqual('bar');
  });
});
