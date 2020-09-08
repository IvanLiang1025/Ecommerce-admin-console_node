

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const productSchema = new mongoose.Schema(
    {
        category: {
            type: ObjectId,
            ref: "Category",
            require: true
        },
        name: {
            type: String,
            trim: true,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            require: true,
            min: 0
        },
        quantity: {
            type: Number,
            require: true,
            min: 0
        },
        sold: {
            type: Number,
            default: 0  
        },
        photo: {
            data: Buffer,
            contentType: String
        }  
    }, {timestamps: true}
)

module.exports = mongoose.model("Product", productSchema);