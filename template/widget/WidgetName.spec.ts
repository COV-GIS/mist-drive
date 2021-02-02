import <%name%> from './<%name%>';

describe('cov/widgets/<%name%>', () => {
  let instance: <%name%>;

  beforeEach(() => {
    instance = new <%name%>();
  });

  test('name should be Slagathor', () => {
    expect(instance.name).toBe('Bill');
  });
});
