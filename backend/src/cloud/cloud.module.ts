import { Module } from '@nestjs/common';
import { AWSModule } from './aws/aws.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SendGridModule } from './sendgrid/sendgrid.module';
import { TwilioModule } from './twilio/twilio.module';
import { StripeModule } from './stripe/stripe.module';
import { CloudController } from './cloud.controller';

@Module({
  imports: [
    AWSModule,
    FirebaseModule,
    CloudinaryModule,
    SendGridModule,
    TwilioModule,
    StripeModule,
  ],
  controllers: [CloudController],
  exports: [
    AWSModule,
    FirebaseModule,
    CloudinaryModule,
    SendGridModule,
    TwilioModule,
    StripeModule,
  ],
})
export class CloudModule {}
