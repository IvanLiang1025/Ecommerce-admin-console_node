

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const CartItemSchema = new mongoose.Schema(
    {
        product: {
            type: ObjectId, 
            ref: "Product"
        },
        name: String,
        count: Number,
        price: Number,
        quantity: Number,
    },
    {timestamps: true}
)

const CartItem = mongoose.model("CartItem", CartItemSchema)

const OrderSchema = new mongoose.Schema(
    {
        products: [CartItemSchema],
        transactionId: {},
        amount: Number,
        addressInfo: {},
        status: {
            type: String,
            default: "Not processed",
            enum: ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"]
        },
        updated: Date,
        user: {
            type: ObjectId,
            ref: "User"
        }

    },
    {timestamps: true}
)

const Order = mongoose.model("Order", OrderSchema);

module.exports = {
    Order,
    CartItem
}