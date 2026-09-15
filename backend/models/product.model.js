
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    desc: {
        type: String,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    imgURL: {
        type: String
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    season: {
        type: String,
        enum: ['summer', 'winter', 'all-season'],
        default: 'all-season'
    },

    // القسم الرئيسي
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    // القسم الفرعي
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },

    // القسم الفرعي الثاني / المستوى الثالث
    subSubCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },

    salesCount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});



productSchema.index({
    category: 1
});

productSchema.index({
    subCategory: 1
});

productSchema.index({
    subSubCategory: 1
});

productSchema.index({
    season: 1
});

productSchema.index({
    salesCount: -1
});

productSchema.index({
    price: 1
});




// // Search index
// productSchema.index({
//     name: 'text',
//     desc: 'text'
// });

// productSchema.index({
//     category: 1
// });

// productSchema.index({
//     subCategory: 1
// });

// productSchema.index({
//     subSubCategory: 1
// });

// productSchema.index({
//     season: 1
// });

// productSchema.index({
//     salesCount: -1
// });


module.exports = mongoose.model('Product', productSchema);

























// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         required:true,
//         trim:true
//     },
//     desc:{
//         type:String,
//         trim:true
//     },
//     price:{
//         type:Number,
//         required:true,
//         min:0
//     },
//     imgURL:{
//         type:String
//     },
//     slug:{
//         type:String,
//         required:true,
//         unique:true,
//         trim:true,
//         lowercase:true
//     },
//     season:{
//         type:String,
//         enum:['summer','winter','all-season'],
//         default:'all-season'
//     },
// category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true
// },

// subCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     default: null
// },
//     stock:{
//         type:Number,
//         default:0,
//         min:0
//     },
//     isActive:{
//         type:Boolean,
//         default:true
//     },
//     isDeleted:{
//         type:Boolean,
//         default:false
//     },
//     deletedAt:{
//         type:Date,
//         default:null
//     },
//     // running counters, cheap way to compute "top sales" without aggregating orders each time
//     salesCount:{
//         type:Number,
//         default:0
//     }
// },{
//     timestamps:true
// });

// productSchema.index({name:'text', desc:'text'});
// productSchema.index({category:1});
// productSchema.index({season:1});
// productSchema.index({salesCount:-1});

// module.exports = mongoose.model('Product', productSchema);
