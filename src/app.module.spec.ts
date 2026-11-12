import { LoggerMiddleware } from '../utils/middlewares/logerMiddleware';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('registers the request logging middleware for every route', () => {
    const forRoutes = jest.fn();
    const consumer = { apply: jest.fn().mockReturnValue({ forRoutes }) };

    new AppModule().configure(consumer as any);

    expect(consumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
    expect(forRoutes).toHaveBeenCalledWith('*');
  });
});
