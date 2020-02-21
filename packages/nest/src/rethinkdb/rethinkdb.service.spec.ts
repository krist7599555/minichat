import { Test, TestingModule } from '@nestjs/testing';
import { RethinkdbService } from './rethinkdb.service';

describe('RethinkdbService', () => {
  let service: RethinkdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RethinkdbService],
    }).compile();

    service = module.get<RethinkdbService>(RethinkdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
