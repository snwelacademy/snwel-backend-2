import { Schema, model, Document } from 'mongoose';
import { paginateOptions } from '@/config/common';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoosePaginate.paginate.options = paginateOptions;


export interface IMaster extends Document {
    code: string;
    parentCode?: string;
    isActive: boolean;
    name: string;
    meta?: Record<string, any>;
    sequence: number,
    type: string
}

const masterSchema = new Schema<IMaster>({
    code: { type: String, required: true, unique: true },
    parentCode: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    name: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, required: false },
    sequence: { type: Number },
    type: {type: String, default: 'MASTER'}
}, {
    timestamps: true,
});

masterSchema.pre('save', async function (next) {
    if (!this.sequence) {
      const maxSequence = await Master.findOne().sort('-sequence').exec();
      this.sequence = maxSequence ? maxSequence.sequence + 1 : 1;
    }
    next();
  });


  masterSchema.plugin(mongoosePaginate);

masterSchema.index({ code: 1 }, { unique: true });
masterSchema.index({ parentCode: 1 });
masterSchema.index({ type: 1 });
masterSchema.index({ sequence: -1 });

const Master = model<IMaster>('Master', masterSchema);

export default Master;
