const Product = require('../models/product.model');
const Category = require('../models/category.model');


// ==================================================
// Helpers
// ==================================================

const ALLOWED_UPDATE_FIELDS = [
    'name',
    'desc',
    'price',
    'slug',
    'stock',
    'category',
    'subCategory',
    'subSubCategory',
    'season'
];

function getPagination(query) {
    let page = Number(query.page) || 1;
    let limit = Number(query.limit) || 20;

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 20;
    }

    // Prevent huge responses
    if (limit > 100) {
        limit = 100;
    }

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
}

function parsePrice(value, fieldName) {
    if (value === undefined || value === '') {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        const error = new Error(
            `${fieldName} must be a valid non-negative number`
        );
        error.statusCode = 400;
        throw error;
    }

    return number;
}


// ==================================================
// Validate Category Hierarchy
// ==================================================

async function validateCategoryHierarchy({
    category,
    subCategory,
    subSubCategory
}) {

    // ------------------------------
    // Main Category
    // ------------------------------

    if (!category) {
        return;
    }

    const selectedCategory =
        await Category.findById(category);

    if (!selectedCategory) {
        const error = new Error('category not found');
        error.statusCode = 404;
        throw error;
    }

    if (selectedCategory.parent) {
        const error =
            new Error('category must be a main category');

        error.statusCode = 400;
        throw error;
    }


    // ------------------------------
    // Sub Category
    // ------------------------------

    if (subCategory) {

        const selectedSubCategory =
            await Category.findById(subCategory);

        if (!selectedSubCategory) {
            const error =
                new Error('subCategory not found');

            error.statusCode = 404;
            throw error;
        }

        if (
            !selectedSubCategory.parent ||
            selectedSubCategory.parent.toString() !==
            category.toString()
        ) {
            const error =
                new Error(
                    'subCategory does not belong to this category'
                );

            error.statusCode = 400;
            throw error;
        }
    }


    // ------------------------------
    // Sub Sub Category
    // ------------------------------

    if (subSubCategory) {

        const selectedSubSubCategory =
            await Category.findById(subSubCategory);

        if (!selectedSubSubCategory) {
            const error =
                new Error('subSubCategory not found');

            error.statusCode = 404;
            throw error;
        }

        if (!subCategory) {
            const error =
                new Error(
                    'subCategory is required when using subSubCategory'
                );

            error.statusCode = 400;
            throw error;
        }

        if (
            !selectedSubSubCategory.parent ||
            selectedSubSubCategory.parent.toString() !==
            subCategory.toString()
        ) {
            const error =
                new Error(
                    'subSubCategory does not belong to this subCategory'
                );

            error.statusCode = 400;
            throw error;
        }
    }
}


// ==================================================
// Create Product
// ==================================================

exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            desc,
            price,
            slug,
            stock,
            category,
            subCategory,
            subSubCategory,
            season
        } = req.body;


        const priceValue = Number(price);
        const stockValue = Number(stock);

        if (
            !Number.isFinite(priceValue) ||
            priceValue < 0
        ) {
            return res.status(400).json({
                error: 'price must be a valid non-negative number'
            });
        }

        if (
            !Number.isInteger(stockValue) ||
            stockValue < 0
        ) {
            return res.status(400).json({
                error: 'stock must be a non-negative integer'
            });
        }


        await validateCategoryHierarchy({
            category,
            subCategory,
            subSubCategory
        });


        const imgURL =
            req.file
                ? req.file.filename
                : undefined;


        const myProduct =
            await Product.create({

                name,
                desc,

                price: priceValue,

                slug,

                stock: stockValue,

                imgURL,

                category,

                subCategory:
                    subCategory || null,

                subSubCategory:
                    subSubCategory || null,

                season

            });


        res.status(201).json({

            message: 'product created',

            data: myProduct

        });

    } catch (err) {

        res.status(err.statusCode || 500).json({
            error: err.message
        });

    }
};


// ==================================================
// Get All Products - Public
// ==================================================

exports.getAllProducts = async (req, res) => {

    try {

        const {
            page,
            limit,
            skip
        } = getPagination(req.query);


        const filter = {

            isDeleted: false,
            isActive: true

        };


        const [
            myProducts,
            total
        ] = await Promise.all([

            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate(
                    'category',
                    'name slug parent'
                )
                .populate(
                    'subCategory',
                    'name slug parent'
                )
                .populate(
                    'subSubCategory',
                    'name slug parent'
                ),

            Product.countDocuments(filter)

        ]);


        res.status(200).json({

            message: 'list of all products',

            pagination: {

                page,

                limit,

                total,

                pages:
                    Math.ceil(total / limit)

            },

            data: myProducts

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Get Product By Slug
// ==================================================

exports.getProductBySlug = async (req, res) => {

    try {

        const slug = req.params.slug;


        const myProduct =
            await Product.findOne({

                slug,

                isDeleted: false,

                isActive: true

            })
                .populate(
                    'category',
                    'name slug parent'
                )
                .populate(
                    'subCategory',
                    'name slug parent'
                )
                .populate(
                    'subSubCategory',
                    'name slug parent'
                );


        if (!myProduct) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        res.status(200).json({

            message:
                `get product by slug: ${slug}`,

            data: myProduct

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Search + Filter Products
// ==================================================

exports.searchProducts = async (req, res) => {

    try {

        const {

            keyword,

            minPrice,

            maxPrice,

            category,

            subCategory,

            subSubCategory,

            season

        } = req.query;


        const {
            page,
            limit,
            skip
        } = getPagination(req.query);


        const filter = {

            isDeleted: false,

            isActive: true

        };


        // ------------------------------
        // Keyword
        // ------------------------------

        if (keyword) {

            filter.$text = {
                $search: keyword
            };

        }


        // ------------------------------
        // Category
        // ------------------------------

        if (category) {

            filter.category = category;

        }


        // ------------------------------
        // Sub Category
        // ------------------------------

        if (subCategory) {

            filter.subCategory =
                subCategory;

        }


        // ------------------------------
        // Sub Sub Category
        // ------------------------------

        if (subSubCategory) {

            filter.subSubCategory =
                subSubCategory;

        }


        // ------------------------------
        // Season
        // ------------------------------

        if (season) {

            filter.season = season;

        }


        // ------------------------------
        // Price
        // ------------------------------

        const min =
            parsePrice(
                minPrice,
                'minPrice'
            );

        const max =
            parsePrice(
                maxPrice,
                'maxPrice'
            );


        if (min !== null && max !== null) {

            if (min > max) {

                return res.status(400).json({
                    error:
                        'minPrice cannot be greater than maxPrice'
                });

            }

        }


        if (
            min !== null ||
            max !== null
        ) {

            filter.price = {};

            if (min !== null) {

                filter.price.$gte = min;

            }

            if (max !== null) {

                filter.price.$lte = max;

            }

        }


        const [
            myProducts,
            total
        ] = await Promise.all([

            Product.find(filter)

                .sort({ createdAt: -1 })

                .skip(skip)

                .limit(limit)

                .populate(
                    'category',
                    'name slug parent'
                )

                .populate(
                    'subCategory',
                    'name slug parent'
                )

                .populate(
                    'subSubCategory',
                    'name slug parent'
                ),

            Product.countDocuments(filter)

        ]);


        res.status(200).json({

            message: 'search results',

            pagination: {

                page,

                limit,

                total,

                pages:
                    Math.ceil(total / limit)

            },

            data: myProducts

        });

    } catch (err) {

        res.status(
            err.statusCode || 500
        ).json({

            error: err.message

        });

    }
};


// ==================================================
// Top Sales
// ==================================================

exports.getTopSales = async (req, res) => {

    try {

        let limit =
            Number(req.query.limit) || 10;

        if (
            !Number.isInteger(limit) ||
            limit < 1
        ) {
            limit = 10;
        }

        if (limit > 100) {
            limit = 100;
        }


        const myProducts =
            await Product.find({

                isDeleted: false,

                isActive: true

            })

                .sort({

                    salesCount: -1

                })

                .limit(limit)

                .populate(
                    'category',
                    'name slug parent'
                )

                .populate(
                    'subCategory',
                    'name slug parent'
                )

                .populate(
                    'subSubCategory',
                    'name slug parent'
                );


        res.status(200).json({

            message:
                'top selling products',

            data: myProducts

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// New Arrivals
// ==================================================

exports.getNewArrivals = async (req, res) => {

    try {

        let limit =
            Number(req.query.limit) || 10;

        if (
            !Number.isInteger(limit) ||
            limit < 1
        ) {
            limit = 10;
        }

        if (limit > 100) {
            limit = 100;
        }


        const myProducts =
            await Product.find({

                isDeleted: false,

                isActive: true

            })

                .sort({

                    createdAt: -1

                })

                .limit(limit)

                .populate(
                    'category',
                    'name slug parent'
                )

                .populate(
                    'subCategory',
                    'name slug parent'
                )

                .populate(
                    'subSubCategory',
                    'name slug parent'
                );


        res.status(200).json({

            message:
                'new arrivals',

            data: myProducts

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Update Product
// ==================================================

exports.updateProduct = async (req, res) => {

    try {

        const product =
            await Product.findOne({

                _id: req.params.id,

                isDeleted: false

            });


        if (!product) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        // ------------------------------
        // Build safe update data
        // ------------------------------

        const updateData = {};


        for (
            const field
            of ALLOWED_UPDATE_FIELDS
        ) {

            if (
                req.body[field] !== undefined
            ) {

                updateData[field] =
                    req.body[field];

            }

        }


        // ------------------------------
        // Numeric validation
        // ------------------------------

        if (
            updateData.price !== undefined
        ) {

            const price =
                Number(updateData.price);

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                return res.status(400).json({
                    error:
                        'price must be a valid non-negative number'
                });

            }

            updateData.price = price;

        }


        if (
            updateData.stock !== undefined
        ) {

            const stock =
                Number(updateData.stock);

            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                return res.status(400).json({
                    error:
                        'stock must be a non-negative integer'
                });

            }

            updateData.stock = stock;

        }


        // ------------------------------
        // Final category values
        // ------------------------------

        const finalCategory =
            updateData.category !== undefined
                ? updateData.category
                : product.category;

        const finalSubCategory =
            updateData.subCategory !== undefined
                ? updateData.subCategory
                : product.subCategory;

        const finalSubSubCategory =
            updateData.subSubCategory !== undefined
                ? updateData.subSubCategory
                : product.subSubCategory;


        // ------------------------------
        // Handle explicit nulls
        // ------------------------------

        const normalizedSubCategory =
            finalSubCategory || null;

        const normalizedSubSubCategory =
            finalSubSubCategory || null;


        // ------------------------------
        // Category hierarchy validation
        // ------------------------------

        await validateCategoryHierarchy({

            category:
                finalCategory,

            subCategory:
                normalizedSubCategory,

            subSubCategory:
                normalizedSubSubCategory

        });


        // ------------------------------
        // Update image
        // ------------------------------

        if (req.file) {

            updateData.imgURL =
                req.file.filename;

        }


        // ------------------------------
        // Normalize category values
        // ------------------------------

        if (
            updateData.subCategory !== undefined
        ) {

            updateData.subCategory =
                normalizedSubCategory;

        }

        if (
            updateData.subSubCategory !== undefined
        ) {

            updateData.subSubCategory =
                normalizedSubSubCategory;

        }


        // ------------------------------
        // If main category changed,
        // clear lower levels unless they
        // were explicitly sent.
        // ------------------------------

        if (
            updateData.category !== undefined &&
            product.category.toString() !==
            finalCategory.toString()
        ) {

            if (
                updateData.subCategory === undefined
            ) {

                updateData.subCategory = null;

            }

            if (
                updateData.subSubCategory === undefined
            ) {

                updateData.subSubCategory = null;

            }

        }


        const myProduct =
            await Product.findOneAndUpdate(

                {
                    _id: req.params.id,

                    isDeleted: false

                },

                updateData,

                {
                    new: true,

                    runValidators: true

                }

            )

                .populate(
                    'category',
                    'name slug parent'
                )

                .populate(
                    'subCategory',
                    'name slug parent'
                )

                .populate(
                    'subSubCategory',
                    'name slug parent'
                );


        res.status(200).json({

            message:
                'product updated',

            data: myProduct

        });

    } catch (err) {

        res.status(
            err.statusCode || 500
        ).json({

            error: err.message

        });

    }
};


// ==================================================
// Toggle Active
// ==================================================

exports.toggleActive = async (req, res) => {

    try {

        const myProduct =
            await Product.findOne({

                _id: req.params.id,

                isDeleted: false

            });


        if (!myProduct) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        myProduct.isActive =
            !myProduct.isActive;


        await myProduct.save();


        res.status(200).json({

            message:
                'product status updated',

            data: myProduct

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Soft Delete Product
// ==================================================

exports.softDeleteProduct = async (req, res) => {

    try {

        const myProduct =
            await Product.findOneAndUpdate(

                {

                    _id: req.params.id,

                    isDeleted: false

                },

                {

                    isDeleted: true,

                    isActive: false,

                    deletedAt: new Date()

                },

                {

                    new: true

                }

            );


        if (!myProduct) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        res.status(200).json({

            message:
                'product deleted',

            data: myProduct

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Restore Product
// ==================================================

exports.restoreProduct = async (req, res) => {

    try {

        const myProduct =
            await Product.findOneAndUpdate(

                req.params.id,

                {

                    isDeleted: false,

                    isActive: true,

                    deletedAt: null

                },

                {

                    new: true

                }

            );


        if (!myProduct) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        res.status(200).json({

            message:
                'product restored',

            data: myProduct

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};


// ==================================================
// Get All Products - Admin
// ==================================================

exports.getAllProductsAdmin = async (req, res) => {

    try {

        const {
            page,
            limit,
            skip
        } = getPagination(req.query);


        const [
            myProducts,
            total
        ] = await Promise.all([

            Product.find()

                .sort({ createdAt: -1 })

                .skip(skip)

                .limit(limit)

                .populate(
                    'category',
                    'name slug parent'
                )

                .populate(
                    'subCategory',
                    'name slug parent'
                )

                .populate(
                    'subSubCategory',
                    'name slug parent'
                ),

            Product.countDocuments()

        ]);


        res.status(200).json({

            message:
                'list of all products (admin)',

            pagination: {

                page,

                limit,

                total,

                pages:
                    Math.ceil(total / limit)

            },

            data: myProducts

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};























// const Product = require('../models/product.model');
// const Category = require('../models/category.model');


// exports.createProduct = async (req, res) => {
//     try {

//         const {
//             name,
//             desc,
//             price,
//             slug,
//             stock,
//             category,
//             subCategory,
//             subSubCategory,
//             season
//         } = req.body;


//         const selectedCategory = await Category.findById(category);

//         if (!selectedCategory) {
//             return res.status(404).json({
//                 error: 'category not found'
//             });
//         }


//         if (selectedCategory.parent) {
//             return res.status(400).json({
//                 error: 'category must be a main category'
//             });
//         }


//         if (subCategory) {

//             const selectedSubCategory =
//                 await Category.findById(subCategory);

//             if (!selectedSubCategory) {
//                 return res.status(404).json({
//                     error: 'subCategory not found'
//                 });
//             }


//             if (
//                 !selectedSubCategory.parent ||
//                 selectedSubCategory.parent.toString() !==
//                 category.toString()
//             ) {
//                 return res.status(400).json({
//                     error: 'subCategory does not belong to this category'
//                 });
//             }
//         }


//         if (subSubCategory) {

//             const selectedSubSubCategory =
//                 await Category.findById(subSubCategory);

//             if (!selectedSubSubCategory) {
//                 return res.status(404).json({
//                     error: 'subSubCategory not found'
//                 });
//             }


//             if (!subCategory) {
//                 return res.status(400).json({
//                     error: 'subCategory is required when using subSubCategory'
//                 });
//             }


//             if (
//                 !selectedSubSubCategory.parent ||
//                 selectedSubSubCategory.parent.toString() !==
//                 subCategory.toString()
//             ) {
//                 return res.status(400).json({
//                     error: 'subSubCategory does not belong to this subCategory'
//                 });
//             }
//         }


//         const imgURL = req.file
//             ? req.file.filename
//             : undefined;


//         const myProduct = await Product.create({

//             name,
//             desc,
//             price,
//             slug,
//             stock,
//             imgURL,

//             category,

//             subCategory: subCategory || null,

//             subSubCategory: subSubCategory || null,

//             season

//         });


//         res.status(201).json({
//             message: 'product created',
//             data: myProduct
//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// exports.getAllProducts = async (req, res) => {
//     try {

//         const myProducts = await Product.find({

//             isDeleted: false,
//             isActive: true

//         })
//             .populate('category', 'name slug parent')
//             .populate('subCategory', 'name slug parent')
//             .populate('subSubCategory', 'name slug parent');


//         res.status(200).json({

//             message: 'list of all products',

//             data: myProducts

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// exports.getProductBySlug = async (req, res) => {
//     try {

//         const slug = req.params.slug;


//         const myProduct = await Product.findOne({

//             slug,
//             isDeleted: false

//         })
//             .populate('category', 'name slug parent')
//             .populate('subCategory', 'name slug parent')
//             .populate('subSubCategory', 'name slug parent');


//         if (!myProduct) {

//             return res.status(404).json({
//                 error: 'product not found'
//             });

//         }


//         res.status(200).json({

//             message: `get product by slug: ${slug}`,

//             data: myProduct

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Search + Filter Products
// // ==================================================
// exports.searchProducts = async (req, res) => {
//     try {

//         const {

//             keyword,
//             minPrice,
//             maxPrice,
//             category,
//             subCategory,
//             subSubCategory,
//             season

//         } = req.query;


//         const filter = {

//             isDeleted: false,
//             isActive: true

//         };


//         // =========================
//         // Keyword
//         // =========================
//         if (keyword) {

//             filter.$text = {
//                 $search: keyword
//             };

//         }


//         // =========================
//         // Category
//         // =========================
//         if (category) {

//             filter.category = category;

//         }


//         // =========================
//         // Sub Category
//         // =========================
//         if (subCategory) {

//             filter.subCategory = subCategory;

//         }


//         // =========================
//         // Sub Sub Category
//         // =========================
//         if (subSubCategory) {

//             filter.subSubCategory = subSubCategory;

//         }


//         // =========================
//         // Season
//         // =========================
//         if (season) {

//             filter.season = season;

//         }


//         // =========================
//         // Price
//         // =========================
//         if (minPrice || maxPrice) {

//             filter.price = {};


//             if (minPrice) {

//                 filter.price.$gte =
//                     Number(minPrice);

//             }


//             if (maxPrice) {

//                 filter.price.$lte =
//                     Number(maxPrice);

//             }

//         }


//         const myProducts =
//             await Product.find(filter)

//                 .populate(
//                     'category',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subCategory',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subSubCategory',
//                     'name slug parent'
//                 );


//         res.status(200).json({

//             message: 'search results',

//             data: myProducts

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Top Sales
// // ==================================================
// exports.getTopSales = async (req, res) => {
//     try {

//         const limit =
//             Number(req.query.limit) || 10;


//         const myProducts =
//             await Product.find({

//                 isDeleted: false,
//                 isActive: true

//             })

//                 .sort({

//                     salesCount: -1

//                 })

//                 .limit(limit)

//                 .populate(
//                     'category',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subCategory',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subSubCategory',
//                     'name slug parent'
//                 );


//         res.status(200).json({

//             message: 'top selling products',

//             data: myProducts

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // New Arrivals
// // ==================================================
// exports.getNewArrivals = async (req, res) => {
//     try {

//         const limit =
//             Number(req.query.limit) || 10;


//         const myProducts =
//             await Product.find({

//                 isDeleted: false,
//                 isActive: true

//             })

//                 .sort({

//                     createdAt: -1

//                 })

//                 .limit(limit)

//                 .populate(
//                     'category',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subCategory',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subSubCategory',
//                     'name slug parent'
//                 );


//         res.status(200).json({

//             message: 'new arrivals',

//             data: myProducts

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Update Product
// // ==================================================
// exports.updateProduct = async (req, res) => {
//     try {

//         const {
//             category,
//             subCategory,
//             subSubCategory
//         } = req.body;


//         // =========================
//         // Check Category
//         // =========================
//         if (category) {

//             const selectedCategory =
//                 await Category.findById(category);


//             if (!selectedCategory) {

//                 return res.status(404).json({
//                     error: 'category not found'
//                 });

//             }


//             if (selectedCategory.parent) {

//                 return res.status(400).json({
//                     error: 'category must be a main category'
//                 });

//             }

//         }


//         // =========================
//         // Check Sub Category
//         // =========================
//         if (subCategory) {

//             const selectedSubCategory =
//                 await Category.findById(subCategory);


//             if (!selectedSubCategory) {

//                 return res.status(404).json({
//                     error: 'subCategory not found'
//                 });

//             }


//             if (
//                 category &&
//                 (
//                     !selectedSubCategory.parent ||
//                     selectedSubCategory.parent.toString() !==
//                     category.toString()
//                 )
//             ) {

//                 return res.status(400).json({
//                     error: 'subCategory does not belong to this category'
//                 });

//             }

//         }


//         // =========================
//         // Check Sub Sub Category
//         // =========================
//         if (subSubCategory) {

//             const selectedSubSubCategory =
//                 await Category.findById(subSubCategory);


//             if (!selectedSubSubCategory) {

//                 return res.status(404).json({
//                     error: 'subSubCategory not found'
//                 });

//             }


//             if (!subCategory) {

//                 return res.status(400).json({
//                     error: 'subCategory is required when using subSubCategory'
//                 });

//             }


//             if (
//                 !selectedSubSubCategory.parent ||
//                 selectedSubSubCategory.parent.toString() !==
//                 subCategory.toString()
//             ) {

//                 return res.status(400).json({
//                     error: 'subSubCategory does not belong to this subCategory'
//                 });

//             }

//         }


//         const updateData = {
//             ...req.body
//         };


//         // Image
//         if (req.file) {

//             updateData.imgURL =
//                 req.file.filename;

//         }


//         const myProduct =
//             await Product.findOneAndUpdate(

//                 {
//                     _id: req.params.id,
//                     isDeleted: false
//                 },

//                 updateData,

//                 {
//                     new: true,
//                     runValidators: true
//                 }

//             )

//                 .populate(
//                     'category',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subCategory',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subSubCategory',
//                     'name slug parent'
//                 );


//         if (!myProduct) {

//             return res.status(404).json({
//                 error: 'product not found'
//             });

//         }


//         res.status(200).json({

//             message: 'product updated',

//             data: myProduct

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Toggle Active
// // ==================================================
// exports.toggleActive = async (req, res) => {
//     try {

//         const myProduct =
//             await Product.findOne({

//                 _id: req.params.id,
//                 isDeleted: false

//             });


//         if (!myProduct) {

//             return res.status(404).json({
//                 error: 'product not found'
//             });

//         }


//         myProduct.isActive =
//             !myProduct.isActive;


//         await myProduct.save();


//         res.status(200).json({

//             message: 'product status updated',

//             data: myProduct

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Soft Delete Product
// // ==================================================
// exports.softDeleteProduct = async (req, res) => {
//     try {

//         const myProduct =
//             await Product.findOneAndUpdate(

//                 {
//                     _id: req.params.id,
//                     isDeleted: false
//                 },

//                 {

//                     isDeleted: true,
//                     isActive: false,
//                     deletedAt: new Date()

//                 },

//                 {
//                     new: true
//                 }

//             );


//         if (!myProduct) {

//             return res.status(404).json({
//                 error: 'product not found'
//             });

//         }


//         res.status(200).json({

//             message: 'product deleted',

//             data: myProduct

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Restore Product
// // ==================================================
// exports.restoreProduct = async (req, res) => {
//     try {

//         const myProduct =
//             await Product.findByIdAndUpdate(

//                 req.params.id,

//                 {

//                     isDeleted: false,
//                     isActive: true,
//                     deletedAt: null

//                 },

//                 {
//                     new: true
//                 }

//             );


//         if (!myProduct) {

//             return res.status(404).json({
//                 error: 'product not found'
//             });

//         }


//         res.status(200).json({

//             message: 'product restored',

//             data: myProduct

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };



// // ==================================================
// // Get All Products - Admin
// // ==================================================
// exports.getAllProductsAdmin = async (req, res) => {
//     try {

//         const myProducts =
//             await Product.find()

//                 .populate(
//                     'category',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subCategory',
//                     'name slug parent'
//                 )

//                 .populate(
//                     'subSubCategory',
//                     'name slug parent'
//                 );


//         res.status(200).json({

//             message:
//                 'list of all products (admin)',

//             data: myProducts

//         });


//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };
















// const Product = require('../models/product.model');


// exports.createProduct = async (req, res) => {
//     try {
//         const {
//             name,
//             desc,
//             price,
//             slug,
//             stock,
//             category,
//             season
//         } = req.body;

        
//         const Category = require('../models/category.model');

//         const selectedCategory = await Category.findById(category);

//         if (!selectedCategory) {
//             return res.status(404).json({
//                 error: 'category not found'
//             });
//         }

//         const imgURL = req.file
//             ? req.file.filename
//             : undefined;

//         const myProduct = await Product.create({
//             name,
//             desc,
//             price,
//             slug,
//             stock,
//             imgURL,
//             category,
//             season
//         });

//         res.status(201).json({
//             message: 'product created',
//             data: myProduct
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


// exports.getAllProducts = async (req, res) => {
//     try {

//         const myProducts = await Product.find({
//             isDeleted: false,
//             isActive: true
//         })
//             .populate('category', 'name slug parent');

//         res.status(200).json({
//             message: 'list of all products',
//             data: myProducts
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };



// exports.getProductBySlug = async (req, res) => {
//     try {

//         const slug = req.params.slug;

//         const myProduct = await Product.findOne({
//             slug,
//             isDeleted: false
//         })
//             .populate('category', 'name slug parent');

//         if (!myProduct) {
//             return res.status(404).json({
//                 error: 'product not found'
//             });
//         }

//         res.status(200).json({
//             message: `get product by slug: ${slug}`,
//             data: myProduct
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


// exports.searchProducts = async (req, res) => {
//     try {

//         const {
//             keyword,
//             minPrice,
//             maxPrice,
//             category,
//             season
//         } = req.query;

//         const filter = {
//             isDeleted: false,
//             isActive: true
//         };

//         if (keyword) {
//             filter.$text = {
//                 $search: keyword
//             };
//         }


    
//         if (category) {
//             filter.category = category;
//         }

//         if (season) {
//             filter.season = season;
//         }

        
//         if (minPrice || maxPric) {

//             filter.price = {};

//             if (minPrice) {
//                 filter.price.$gte = Number(minPrice);
//             }

//             if (maxPrice) {
//                 filter.price.$lte = Number(maxPrice);
//             }
//         }


//         const myProducts = await Product.find(filter)
//             .populate('category', 'name slug parent');


//         res.status(200).json({
//             message: 'search results',
//             data: myProducts
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


// // =========================
// // Top Selling Products
// // =========================
// exports.getTopSales = async (req, res) => {
//     try {

//         const limit = Number(req.query.limit) || 10;

//         const myProducts = await Product.find({
//             isDeleted: false,
//             isActive: true
//         })
//             .sort({
//                 salesCount: -1
//             })
//             .limit(limit)
//             .populate('category', 'name slug parent');


//         res.status(200).json({
//             message: 'top selling products',
//             data: myProducts
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


// // =========================
// // New Arrivals
// // =========================
// exports.getNewArrivals = async (req, res) => {
//     try {

//         const limit = Number(req.query.limit) || 10;

//         const myProducts = await Product.find({
//             isDeleted: false,
//             isActive: true
//         })
//             .sort({
//                 createdAt: -1
//             })
//             .limit(limit)
//             .populate('category', 'name slug parent');


//         res.status(200).json({
//             message: 'new arrivals',
//             data: myProducts
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


// // =========================
// // Update Product
// // =========================
// exports.updateProduct = async (req, res) => {
//     try {

//         const updateData = {
//             ...req.body
//         };


//         // If new image uploaded
//         if (req.file) {
//             updateData.imgURL = req.file.filename;
//         }


//         // If category is being updated
//         if (updateData.category) {

//             const Category = require('../models/category.model');

//             const selectedCategory = await Category.findById(
//                 updateData.category
//             );

//             if (!selectedCategory) {
//                 return res.status(404).json({
//                     error: 'category not found'
//                 });
//             }
//         }


//         const myProduct = await Product.findOneAndUpdate(
//             {
//                 _id: req.params.id,
//                 isDeleted: false
//             },
//             updateData,
//             {
//                 new: true,
//                 runValidators: true
//             }
//         )
//             .populate('category', 'name slug parent');


//         if (!myProduct) {
//             return res.status(404).json({
//                 error: 'product not found'
//             });
//         }


//         res.status(200).json({
//             message: 'product updated',
//             data: myProduct
//         });

//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };


// // =========================
// // Toggle Active
// // =========================
// exports.toggleActive = async (req, res) => {
//     try {

//         const myProduct = await Product.findOne({
//             _id: req.params.id,
//             isDeleted: false
//         });


//         if (!myProduct) {
//             return res.status(404).json({
//                 error: 'product not found'
//             });
//         }


//         myProduct.isActive = !myProduct.isActive;

//         await myProduct.save();


//         res.status(200).json({
//             message: 'product status updated',
//             data: myProduct
//         });

//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };


// // =========================
// // Soft Delete Product
// // =========================
// exports.softDeleteProduct = async (req, res) => {
//     try {

//         const myProduct = await Product.findOneAndUpdate(
//             {
//                 _id: req.params.id,
//                 isDeleted: false
//             },
//             {
//                 isDeleted: true,
//                 isActive: false,
//                 deletedAt: new Date()
//             },
//             {
//                 new: true
//             }
//         );


//         if (!myProduct) {
//             return res.status(404).json({
//                 error: 'product not found'
//             });
//         }


//         res.status(200).json({
//             message: 'product deleted',
//             data: myProduct
//         });

//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };


// // =========================
// // Restore Product
// // =========================
// exports.restoreProduct = async (req, res) => {
//     try {

//         const myProduct = await Product.findOneAndUpdate(
//             {
//                 _id: req.params.id,
//                 isDeleted: true
//             },
//             {
//                 isDeleted: false,
//                 deletedAt: null,
//                 isActive: true
//             },
//             {
//                 new: true
//             }
//         );


//         if (!myProduct) {
//             return res.status(404).json({
//                 error: 'product not found'
//             });
//         }


//         res.status(200).json({
//             message: 'product restored',
//             data: myProduct
//         });

//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };


// // =========================
// // Get All Products - Admin
// // =========================
// exports.getAllProductsAdmin = async (req, res) => {
//     try {

//         const myProducts = await Product.find()
//             .populate('category', 'name slug parent');


//         res.status(200).json({
//             message: 'list of all products (admin)',
//             data: myProducts
//         });

//     } catch (err) {

//         res.status(500).json({
//             error: err.message
//         });

//     }
// };























// const Product = require('../models/product.model');

// exports.createProduct = async (req,res) => {
//     try{
//         const {name, desc, price, slug, stock, category, season} = req.body;
//         const imgURL = req.file ? req.file.filename : undefined;
//         const myProduct = await Product.create({name, desc, price, slug, stock, imgURL, category, season});
//         res.status(201).json({message:'product created', data:myProduct});
//     }catch(err){
//         res.status(500).json({error:err.message});
//     }
// };

// exports.getAllProducts = async (req,res) => {
//     const myProducts = await Product.find({isDeleted:false, isActive:true}).populate('category','name slug');
//     res.status(200).json({message:'list of all products', data:myProducts});
// };

// exports.getProductBySlug = async (req,res) => {
//     const slug = req.params.slug;
//     const myProduct = await Product.findOne({slug, isDeleted:false}).populate('category','name slug');
//     if(!myProduct){
//         return res.status(404).json({error:'product not found'});
//     }
//     res.status(200).json({message:`get product by slug: ${slug}`, data:myProduct});
// };

// // search + filter: /product/search?keyword=&minPrice=&maxPrice=&category=&season=
// exports.searchProducts = async (req,res) => {
//     const {keyword, minPrice, maxPrice, category, season} = req.query;
//     const filter = {isDeleted:false, isActive:true};

//     if(keyword) filter.$text = {$search:keyword};
//     if(category) filter.category = category;
//     if(season) filter.season = season;
//     if(minPrice || maxPrice){
//         filter.price = {};
//         if(minPrice) filter.price.$gte = Number(minPrice);
//         if(maxPrice) filter.price.$lte = Number(maxPrice);
//     }

//     const myProducts = await Product.find(filter).populate('category','name slug');
//     res.status(200).json({message:'search results', data:myProducts});
// };

// // home page: top selling products
// exports.getTopSales = async (req,res) => {
//     const limit = Number(req.query.limit) || 10;
//     const myProducts = await Product.find({isDeleted:false, isActive:true})
//         .sort({salesCount:-1})
//         .limit(limit);
//     res.status(200).json({message:'top selling products', data:myProducts});
// };

// // home page: newest products
// exports.getNewArrivals = async (req,res) => {
//     const limit = Number(req.query.limit) || 10;
//     const myProducts = await Product.find({isDeleted:false, isActive:true})
//         .sort({createdAt:-1})
//         .limit(limit);
//     res.status(200).json({message:'new arrivals', data:myProducts});
// };

// exports.updateProduct = async (req,res) => {
//     try{
//         const updateData = {...req.body};
//         if(req.file){
//             updateData.imgURL = req.file.filename;
//         }
//         const myProduct = await Product.findOneAndUpdate(
//             {_id:req.params.id, isDeleted:false},
//             updateData,
//             {new:true, runValidators:true}
//         );
//         if(!myProduct){
//             return res.status(404).json({error:'product not found'});
//         }
//         res.status(200).json({message:'product updated', data:myProduct});
//     }catch(err){
//         res.status(500).json({error:err.message});
//     }
// };

// exports.toggleActive = async (req,res) => {
//     const myProduct = await Product.findOne({_id:req.params.id, isDeleted:false});
//     if(!myProduct){
//         return res.status(404).json({error:'product not found'});
//     }
//     myProduct.isActive = !myProduct.isActive;
//     await myProduct.save();
//     res.status(200).json({message:'product status updated', data:myProduct});
// };

// exports.softDeleteProduct = async (req,res) => {
//     const myProduct = await Product.findByIdAndUpdate(
//         req.params.id,
//         {isDeleted:true, isActive:false, deletedAt:new Date()},
//         {new:true}
//     );
//     if(!myProduct){
//         return res.status(404).json({error:'product not found'});
//     }
//     res.status(200).json({message:'product deleted', data:myProduct});
// };

// exports.restoreProduct = async (req,res) => {
//     const myProduct = await Product.findByIdAndUpdate(
//         req.params.id,
//         {isDeleted:false, deletedAt:null},
//         {new:true}
//     );
//     if(!myProduct){
//         return res.status(404).json({error:'product not found'});
//     }
//     res.status(200).json({message:'product restored', data:myProduct});
// };

// exports.getAllProductsAdmin = async (req,res) => {
//     const myProducts = await Product.find().populate('category','name slug');
//     res.status(200).json({message:'list of all products (admin)', data:myProducts});
// };
