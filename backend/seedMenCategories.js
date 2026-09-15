require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/category.model');

const menCategories = [
    {
        name: 'تي شيرت',
        slug: 'men-t-shirts',
        subcategories: [
            ['بولو ساده', 'men-plain-polo'],
            ['تي شيرت تريكو', 'men-knitted-t-shirts'],
            ['بولو مطبوع', 'men-printed-polo'],
            ['كم طويل', 'men-long-sleeve-t-shirts']
        ]
    },
    {
        name: 'بنطلونات',
        slug: 'men-pants',
        subcategories: [
            ['بنطلون جينز', 'men-jeans'],
            ['بنطلونات جبردين', 'men-gabardine-pants'],
            ['بنطلونات للبيت', 'men-home-pants']
        ]
    },
    {
        name: 'شورتات',
        slug: 'men-shorts',
        subcategories: [
            ['شورت شاطئ', 'men-beach-shorts'],
            ['ميلتون شورت', 'men-milton-shorts'],
            ['شورتات', 'men-shorts-all']
        ]
    },
    {
        name: 'قمصان',
        slug: 'men-shirts',
        subcategories: [
            ['كم طويل', 'men-long-sleeve-shirts'],
            ['نص كم', 'men-short-sleeve-shirts'],
            ['قميص كاروهات', 'men-checkered-shirts']
        ]
    },
    {
        name: 'الجواكت',
        slug: 'men-jackets',
        subcategories: [
            ['جاكيت بامب', 'men-bomber-jackets'],
            ['جاكيت جلد', 'men-leather-jackets']
        ]
    },
    {
        name: 'سويت شيرت',
        slug: 'men-sweatshirts',
        subcategories: [
            ['سويت شيرت ساده', 'men-plain-sweatshirts'],
            ['سويت شيرت بسوسته', 'men-zip-sweatshirts'],
            ['هودي', 'men-hoodies']
        ]
    },
    {
        name: 'بلوفر',
        slug: 'men-pullovers',
        subcategories: [
            ['بلوفر ساده', 'men-plain-pullovers'],
            ['بلوفر مقلم', 'men-striped-pullovers'],
            ['هاف كول', 'men-half-cool-pullovers']
        ]
    }
];

async function seedMenCategories() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB Connected');

        let men = await Category.findOne({ slug: 'men' });

        if (!men) {
            men = await Category.create({
                name: 'رجال',
                slug: 'men',
                parent: null,
                isActive: true
            });
            console.log('تم إنشاء القسم الرئيسي: رجال');
        } else {
            console.log('القسم الرئيسي "رجال" موجود بالفعل');
        }

        for (const category of menCategories) {
            let mainSubCategory = await Category.findOne({ slug: category.slug });

            if (!mainSubCategory) {
                mainSubCategory = await Category.create({
                    name: category.name,
                    slug: category.slug,
                    parent: men._id,
                    isActive: true
                });
                console.log(`تم إنشاء القسم: ${category.name}`);
            } else {
                mainSubCategory.parent = men._id;
                await mainSubCategory.save();
                console.log(`القسم موجود بالفعل: ${category.name}`);
            }

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
                    exists.parent = mainSubCategory._id;
                    await exists.save();
                    console.log(`  + القسم الفرعي موجود: ${name}`);
                }
            }
        }

        console.log('\nتم الانتهاء من إضافة أقسام الرجال بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة أقسام الرجال:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedMenCategories();
