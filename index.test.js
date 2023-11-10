import index from './index';


test('index', async () => {
    expect(await index()).toBe(0);
});
