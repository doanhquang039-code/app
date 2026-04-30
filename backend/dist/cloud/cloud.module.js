"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudModule = void 0;
const common_1 = require("@nestjs/common");
const aws_module_1 = require("./aws/aws.module");
const firebase_module_1 = require("./firebase/firebase.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const sendgrid_module_1 = require("./sendgrid/sendgrid.module");
const twilio_module_1 = require("./twilio/twilio.module");
const stripe_module_1 = require("./stripe/stripe.module");
const cloud_controller_1 = require("./cloud.controller");
let CloudModule = class CloudModule {
};
exports.CloudModule = CloudModule;
exports.CloudModule = CloudModule = __decorate([
    (0, common_1.Module)({
        imports: [
            aws_module_1.AWSModule,
            firebase_module_1.FirebaseModule,
            cloudinary_module_1.CloudinaryModule,
            sendgrid_module_1.SendGridModule,
            twilio_module_1.TwilioModule,
            stripe_module_1.StripeModule,
        ],
        controllers: [cloud_controller_1.CloudController],
        exports: [
            aws_module_1.AWSModule,
            firebase_module_1.FirebaseModule,
            cloudinary_module_1.CloudinaryModule,
            sendgrid_module_1.SendGridModule,
            twilio_module_1.TwilioModule,
            stripe_module_1.StripeModule,
        ],
    })
], CloudModule);
//# sourceMappingURL=cloud.module.js.map