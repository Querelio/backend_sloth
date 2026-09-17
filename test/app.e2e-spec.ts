import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) is available', () => {
    return request(app.getHttpServer()).post('/auth/register').expect(400);
  });

  it('/auth/login (POST) is available', () => {
    return request(app.getHttpServer()).post('/auth/login').expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
