const Category = require('../models/category.model');
const Product = require('../models/product.model');


// ==================================================
// Create Category
// ==================================================

exports.createCategory = async (req, res) => {
    try {

        const {
            name,
            slug,
            parent
        } = req.body;


        let parentCategory = null;


        // ------------------------------------------
        // Validate Parent
        // ------------------------------------------

        if (parent) {

            parentCategory =
                await Category.findById(parent);

            if (!parentCategory) {

                return res.status(404).json({
                    error: 'parent category not found'
                });

            }


            // --------------------------------------
            // Prevent Level 4
            // --------------------------------------

            if (parentCategory.parent) {

                const grandParent =
                    await Category.findById(
                        parentCategory.parent
                    );

                if (
                    grandParent &&
                    grandParent.parent
                ) {

                    return res.status(400).json({
                        error:
                            'maximum category depth is 3 levels'
                    });

                }

            }

        }


        const myCategory =
            await Category.create({

                name,

                slug,

                parent:
                    parent || null

            });


        res.status(201).json({

            message: 'category created',

            data: myCategory

        });

    } catch (err) {

        res.status(
            err.code === 11000 ? 400 : 500
        ).json({

            error:
                err.code === 11000
                    ? 'slug already exists'
                    : err.message

        });

    }
};


// ==================================================
// Build Category Tree
// ==================================================

const buildCategoryTree = async (
    parentId = null
) => {

    const categories =
        await Category.find({

            parent: parentId,

            isActive: true

        }).sort({

            createdAt: 1

        });


    const result =
        await Promise.all(

            categories.map(
                async (category) => {

                    const children =
                        await buildCategoryTree(
                            category._id
                        );


                    return {

                        ...category.toObject(),

                        subCategories:
                            children

                    };

                }
            )

        );


    return result;
};


// ==================================================
// Get All Categories
// ==================================================

exports.getAllCategories =
    async (req, res) => {

        try {

            const categories =
                await buildCategoryTree();


            res.status(200).json({

                message:
                    'list of all categories',

                data: categories

            });

        } catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    };


// ==================================================
// Check if Parent Change Creates Cycle
// ==================================================

async function createsCycle(
    categoryId,
    newParentId
) {

    let currentParent =
        await Category.findById(newParentId);


    while (currentParent) {

        if (
            currentParent._id.toString() ===
            categoryId.toString()
        ) {

            return true;

        }


        if (!currentParent.parent) {

            return false;

        }


        currentParent =
            await Category.findById(
                currentParent.parent
            );

    }


    return false;
}


// ==================================================
// Get Category Depth
// ==================================================

async function getCategoryDepth(
    parentId
) {

    let depth = 1;

    let current =
        await Category.findById(parentId);


    while (current && current.parent) {

        depth++;

        current =
            await Category.findById(
                current.parent
            );

    }


    return depth;
}


// ==================================================
// Update Category
// ==================================================

exports.updateCategory =
    async (req, res) => {

        try {

            const myCategory =
                await Category.findById(
                    req.params.id
                );


            if (!myCategory) {

                return res.status(404).json({
                    error: 'category not found'
                });

            }


            const {
                name,
                slug,
                parent,
                isActive
            } = req.body;


            const updateData = {};


            // --------------------------------------
            // Safe fields only
            // --------------------------------------

            if (name !== undefined) {
                updateData.name = name;
            }

            if (slug !== undefined) {
                updateData.slug = slug;
            }

            if (isActive !== undefined) {
                updateData.isActive = isActive;
            }


            // --------------------------------------
            // Parent update
            // --------------------------------------

            if (parent !== undefined) {

                // Remove parent
                if (
                    parent === null ||
                    parent === ''
                ) {

                    updateData.parent = null;

                } else {

                    if (
                        parent.toString() ===
                        myCategory._id.toString()
                    ) {

                        return res.status(400).json({
                            error:
                                'category cannot be its own parent'
                        });

                    }


                    const parentCategory =
                        await Category.findById(
                            parent
                        );


                    if (!parentCategory) {

                        return res.status(404).json({
                            error:
                                'parent category not found'
                        });

                    }


                    // --------------------------------
                    // Prevent circular relation
                    // --------------------------------

                    const cycle =
                        await createsCycle(
                            myCategory._id,
                            parentCategory._id
                        );


                    if (cycle) {

                        return res.status(400).json({
                            error:
                                'invalid parent: circular category relation'
                        });

                    }


                    // --------------------------------
                    // Max 3 levels
                    // --------------------------------

                    const parentDepth =
                        await getCategoryDepth(
                            parentCategory._id
                        );


                    if (parentDepth >= 3) {

                        return res.status(400).json({
                            error:
                                'maximum category depth is 3 levels'
                        });

                    }


                    updateData.parent =
                        parentCategory._id;

                }

            }


            const updatedCategory =
                await Category.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,

                        runValidators: true

                    }

                );


            res.status(200).json({

                message:
                    'category updated',

                data:
                    updatedCategory

            });

        } catch (err) {

            res.status(

                err.code === 11000
                    ? 400
                    : 500

            ).json({

                error:

                    err.code === 11000
                        ? 'slug already exists'
                        : err.message

            });

        }

    };


// ==================================================
// Delete Category
// ==================================================

exports.deleteCategory =
    async (req, res) => {

        try {

            const myCategory =
                await Category.findById(
                    req.params.id
                );


            if (!myCategory) {

                return res.status(404).json({
                    error:
                        'category not found'
                });

            }


            // --------------------------------------
            // Check children
            // --------------------------------------

            const children =
                await Category.findOne({

                    parent:
                        req.params.id

                });


            if (children) {

                return res.status(400).json({

                    error:
                        'cannot delete category because it has sub-categories'

                });

            }


            // --------------------------------------
            // Check Products
            // --------------------------------------

            const productUsingCategory =
                await Product.findOne({

                    $or: [

                        {
                            category:
                                myCategory._id
                        },

                        {
                            subCategory:
                                myCategory._id
                        },

                        {
                            subSubCategory:
                                myCategory._id
                        }

                    ]

                });


            if (productUsingCategory) {

                return res.status(400).json({

                    error:
                        'cannot delete category because it is used by products'

                });

            }


            await Category.findByIdAndDelete(
                myCategory._id
            );


            res.status(200).json({

                message:
                    'category deleted'

            });

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };































// const Category = require('../models/category.model');


// exports.createCategory = async (req, res) => {
//     try {
//         const { name, slug, parent } = req.body;

//         let parentCategory = null;

//         if (parent) {
//             parentCategory = await Category.findById(parent);

//             if (!parentCategory) {
//                 return res.status(404).json({
//                     error: 'parent category not found'
//                 });
//             }
//         }

//         const myCategory = await Category.create({
//             name,
//             slug,
//             parent: parent || null
//         });

//         res.status(201).json({
//             message: 'category created',
//             data: myCategory
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };
// const buildCategoryTree = async (parentId = null) => {

//     const categories = await Category.find({
//         parent: parentId,
//         isActive: true
//     }).sort({ createdAt: 1 });

//     const result = await Promise.all(
//         categories.map(async (category) => {

//             const children = await buildCategoryTree(category._id);

//             return {
//                 ...category.toObject(),
//                 subCategories: children
//             };

//         })
//     );

//     return result;
// };



// exports.getAllCategories = async (req, res) => {
//     try {

//         const categories = await buildCategoryTree();

//         res.status(200).json({
//             message: 'list of all categories',
//             data: categories
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };



// exports.updateCategory = async (req, res) => {
//     try {

//         const myCategory = await Category.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!myCategory) {
//             return res.status(404).json({
//                 error: 'category not found'
//             });
//         }

//         res.status(200).json({
//             message: 'category updated',
//             data: myCategory
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };



// exports.deleteCategory = async (req, res) => {
//     try {

//         // نتأكد إن القسم موجود
//         const myCategory = await Category.findById(req.params.id);

//         if (!myCategory) {
//             return res.status(404).json({
//                 error: 'category not found'
//             });
//         }

//         const children = await Category.findOne({
//             parent: req.params.id
//         });

//         if (children) {
//             return res.status(400).json({
//                 error: 'cannot delete category because it has sub-categories'
//             });
//         }

//         await Category.findByIdAndDelete(req.params.id);

//         res.status(200).json({
//             message: 'category deleted'
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };

















// const Category = require('../models/category.model');

// exports.createCategory = async (req,res) => {
//     try{
//         const {name, slug, parent} = req.body;
//         const myCategory = await Category.create({name, slug, parent: parent || null});
//         res.status(201).json({message:'category created', data:myCategory});
//     }catch(err){
//         res.status(500).json({error:err.message});
//     }
// };

// // public: returns main categories with their sub-categories nested
// exports.getAllCategories = async (req,res) => {
//     const mainCategories = await Category.find({parent:null, isActive:true});

//     const withSubs = await Promise.all(mainCategories.map(async (cat) => {
//         const subCategories = await Category.find({parent:cat._id, isActive:true});
//         return {...cat.toObject(), subCategories};
//     }));

//     res.status(200).json({message:'list of all categories', data:withSubs});
// };

// exports.updateCategory = async (req,res) => {
//     try{
//         const myCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});
//         if(!myCategory){
//             return res.status(404).json({error:'category not found'});
//         }
//         res.status(200).json({message:'category updated', data:myCategory});
//     }catch(err){
//         res.status(500).json({error:err.message});
//     }
// };

// exports.deleteCategory = async (req,res) => {
//     const myCategory = await Category.findByIdAndDelete(req.params.id);
//     if(!myCategory){
//         return res.status(404).json({error:'category not found'});
//     }
//     res.status(200).json({message:'category deleted'});
// };
