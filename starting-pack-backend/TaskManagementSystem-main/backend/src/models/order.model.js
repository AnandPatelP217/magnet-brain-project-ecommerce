import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    items:[
        {
            productId:String,
        name:String,
        price:Number,
        quantity:Number,
        }
    ]
})