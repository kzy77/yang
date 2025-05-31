// 导入测试库
import '@testing-library/jest-dom';

// 这里可以添加全局的Jest设置
// 例如模拟window对象中的方法，全局测试工具等

// 模拟next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
})); 