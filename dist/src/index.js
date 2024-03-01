"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function consumeMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            vhost: process.env.AMQP_VHOST,
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PASSWORD,
            port: process.env.AMQP_PORT,
        };
        const url = process.env.AMQP_URL;
        const exch = process.env.AMQP_EXCH;
        const queue = process.env.AMQP_QUEUE;
        const urlHost = process.env.HOST_URL;
        if (url && exch && queue) {
            const connection = yield (0, amqplib_1.connect)(url, options);
            const channel = yield connection.createChannel();
            yield channel.assertQueue(exch, { durable: false });
            channel.consume(queue, (payment) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (payment) {
                        const paymentContent = payment.content.toString();
                        const res = yield axios_1.default.post(`${urlHost}/payments`, JSON.parse(paymentContent));
                        console.log('successful payment', res);
                        yield channel.publish(exch, 'successful payment', Buffer.from(paymentContent));
                        yield channel.ack(payment);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }), { noAck: false });
        }
    });
}
consumeMessages().then(() => console.log('Connected')).catch(error => console.error(error));
