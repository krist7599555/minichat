import { Test, TestingModule } from '@nestjs/testing';
import { RethinkdbService } from './rethinkdb.service';
import { RethinkdbModule } from './rethinkdb.module';

describe('RethinkdbService', () => {
  let service: RethinkdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RethinkdbService],
      imports: [RethinkdbModule.forRoot({ db: 'testminichat' })],
    }).compile();
    service = await module.resolve(RethinkdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
