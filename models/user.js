

const mongoose = require("mongoose");

const userSchema =new mongoose.Schema(
    { 
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        about: {
            type: String,
            trim: true
        },
     
        role: {
            type: Number,
            default: 0
        },
        history: {
            type: Array,
            default: []
        }

    }, {timestamps: true}
)

// virtual property
userSchema.virtual("_password")
    .set(function(password){
        this.password = password
    })
    .get(function(){
        return this.password
    })

userSchema.methods = {
    authorizePassword: function(password){
        return password === this.password;
    }
}


//virtual property
// userSchema.virtual("password")
//     .set(function(password){
//         this._password = password
//         this.salt = uuidv1()
//         this.hashed_password = this.encryptPassword(password)
//     })
//     .get(function(){
//         return this._password
//     })

// userSchema.methods = {
//     authorizePassword: function(password){
//         return this.encryptPassword(password) === this.hashed_password;
//     },
//     encryptPassword: function(password){
//         if (!password)
//             return "";
        
//         return crypto.createHmac("sha256", this.salt)
//             .update(password)
//             .digest("hex");
//     }
// }



module.exports = mongoose.model("User", userSchema);