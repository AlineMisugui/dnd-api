import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ResponseTimeLoggerDocument = HydratedDocument<ResponseTimeLogger>;

@Schema()
export class ResponseTimeLogger {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  route: string;

  @Prop({ required: true })
  responseTimeMiliseconds: number;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const ResponseTimeLoggerSchema =
  SchemaFactory.createForClass(ResponseTimeLogger);
