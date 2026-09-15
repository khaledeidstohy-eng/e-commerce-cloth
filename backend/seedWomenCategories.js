
require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/category.model');

// const mongoose = require('mongoose');
// const Category = require('./models/category.model');

// لو مكان ملف الـ Model مختلف عندك، عدّل السطر السابق فقط.

const womenCategories = [
    {
        name: 'تي شيرت',
        slug: 'women-t-shirts',
        subcategories: [
            ['نص كم', 'women-half-sleeve'],
            ['توب', 'women-tops'],
            ['تي شيرت مطبوع', 'women-printed-t-shirts'],
            ['كم طويل', 'women-long-sleeve'],
            ['Workout', 'women-workout']
        ]
    },
    {
        name: 'جواكت',
        slug: 'women-jackets',
        subcategories: [
            ['جاكيت بومبر', 'women-bomber-jackets'],
            ['جاكيت جينز', 'women-denim-jackets'],
            ['جاكيت جلد', 'women-leather-jackets'],
            ['جاكيت جوخ', 'women-wool-jackets'],
            ['جاكيت كابوسول ورباط', 'women-hooded-jackets']
        ]
    },
    {
        name: 'سويت شيرت',
        slug: 'women-sweatshirts',
        subcategories: [
            ['سويت شيرت سادة', 'women-plain-sweatshirts'],
            ['سويت شيرت بوسوة', 'women-printed-sweatshirts'],
            ['هودي', 'women-hoodies']
        ]
    },
    {
        name: 'قمصان وبلاوزات',
        slug: 'women-shirts-blouses',
        subcategories: [
            ['قمصان', 'women-shirts'],
            ['قميص جينز', 'women-denim-shirts'],
            ['قميص ستان', 'women-satin-shirts'],
            ['قميص شتوي', 'women-winter-shirts']
        ]
    },
    {
        name: 'بلوفر',
        slug: 'women-pullovers',
        subcategories: [
            ['بلوفر سادة', 'women-plain-pullovers'],
            ['هاي كول', 'women-high-neck-pullovers']
        ]
    },
    
    {
        name: 'بنطلونات',
        slug: 'women-pants',
        subcategories: [
            ['بنطلون جينز', 'women-jeans'],
            ['بنطلون كلاسيك', 'women-classic-pants'],
            ['بنطلون رياضي', 'women-sport-pants']
        ]
    },
    {
        name: 'الجيب',
        slug: 'women-skirts',
        subcategories: [
            ['جيبات صيفي', 'women-summer-skirts'],
            ['جيبات شتوي', 'women-winter-skirts']
        ]
    },
    {
        name: 'سوست & فستان',
        slug: 'women-suits-dresses',
        subcategories: [
            ['سوست', 'women-suits'],
            ['فستان', 'women-dresses']
        ]
    },
   
];

async function seedWomenCategories() {
    try {
        // يستخدم نفس اتصال MongoDB الموجود عندك في .env
        await mongoose.connect(process.env.DB_URI);
        // await mongoose.connect(process.env.MONGO_URI);

        // نبحث عن التصنيف الرئيسي نساء
        let women = await Category.findOne({ slug: 'women' });

        // لو مش موجود، ننشئه
        if (!women) {
            women = await Category.create({
                name: 'نساء',
                slug: 'women',
                parent: null,
                isActive: true
            });

            console.log('تم إنشاء القسم الرئيسي: نساء');
        } else {
            console.log('القسم الرئيسي "نساء" موجود بالفعل');
        }

        for (const category of womenCategories) {
            let mainSubCategory = await Category.findOne({
                slug: category.slug
            });

            if (!mainSubCategory) {
                mainSubCategory = await Category.create({
                    name: category.name,
                    slug: category.slug,
                    parent: women._id,
                    isActive: true
                });

                console.log(`تم إنشاء القسم: ${category.name}`);
            } else {
                // نتأكد أنه مربوط بنساء
                if (String(mainSubCategory.parent) !== String(women._id)) {
                    mainSubCategory.parent = women._id;
                    await mainSubCategory.save();
                }

                console.log(`القسم موجود بالفعل: ${category.name}`);
            }

            // إنشاء الأقسام الفرعية
            for (const [name, slug] of category.subcategories) {
                const exists = await Category.findOne({ slug });

                if (!exists) {
                    await Category.create({
                        name,
                        slug,
                        parent: mainSubCategory._id,
                        isActive: true
                    });

                    console.log(`  + تم إنشاء القسم الفرعي: ${name}`);
                } else {
                    // نتأكد أنه مربوط بالقسم الصحيح
                    if (String(exists.parent) !== String(mainSubCategory._id)) {
                        exists.parent = mainSubCategory._id;
                        await exists.save();
                    }

                    console.log(`  + القسم الفرعي موجود: ${name}`);
                }
            }
        }

        console.log('\nتم الانتهاء من إضافة أقسام النساء بنجاح ✅');
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة الأقسام:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedWomenCategories();
