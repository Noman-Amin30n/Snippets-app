import { Document } from "mongoose"

export const authUser = (doc: Document) => {
    const obj = doc.toObject();
    delete obj.__v;
    const { _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
}