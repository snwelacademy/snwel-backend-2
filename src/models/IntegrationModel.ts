import { Schema, model, Document } from 'mongoose';

// Define the interface for TypeScript
export interface IIntegration extends Document {
  serviceName: string;
  config: Record<string, any>;
  enabled: boolean;
  supportedActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema
const IntegrationSchema = new Schema<IIntegration>({
  serviceName: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },  // API keys, credentials, etc.
  enabled: { type: Boolean, default: true },
  supportedActions: { type: [String], required: true },  // e.g., ['otp', 'promotionalEmail']
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the model
const IntegrationModel = model<IIntegration>('Integration', IntegrationSchema);

export default IntegrationModel;