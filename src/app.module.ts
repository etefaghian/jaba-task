import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { LogModule } from './log/log.module';
import { EmailModule } from './email/email.module';
import { CodeModule } from './code/code.module';
import { MongooseModule } from '@nestjs/mongoose';

const mongooseModule = MongooseModule.forRoot('mongodb://localhost/nest');

@Module({
  imports: [UserModule, LogModule, EmailModule, CodeModule, mongooseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
