require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/category.model');

const kidsCategories = [
    {
        name: 'أولاد',
        slug: 'kids-boys',
        subcategories: [
            ['تي شيرت', 'kids-boys-tshirts'],
            ['بنطلونات', 'kids-boys-pants'],
            ['شورتات', 'kids-boys-shorts']
        ]
    },
    {
        name: 'بنات',
        slug: 'kids-girls',
        subcategories: [
            ['فساتين', 'kids-girls-dresses'],
            ['تي شيرت', 'kids-girls-tshirts'],
            ['بناطيل', 'kids-girls-pants']
        ]
    },
    {
        name: 'أطفال رضع',
        slug: 'kids-babies',
        subcategories: [
            ['أوفرول', 'kids-babies-overalls'],
            ['بيجامات', 'kids-babies-pajamas']
        ]
    }
];

async function seedKidsCategories() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB Connected');

        let kids = await Category.findOne({ slug: 'kids' });

        if (!kids) {
            kids = await Category.create({
                name: 'أطفال',
                slug: 'kids',
                parent: null,
                isActive: true
            });
            console.log('تم إنشاء القسم الرئيسي: أطفال');
        } else {
            console.log('القسم الرئيسي "أطفال" موجود بالفعل');
        }

        for (const category of kidsCategories) {
            let mainSubCategory = await Category.findOne({ slug: category.slug });

            if (!mainSubCategory) {
                mainSubCategory = await Category.create({
                    name: category.name,
                    slug: category.slug,
                    parent: kids._id,
                    isActive: true
                });
                console.log(`تم إنشاء القسم: ${category.name}`);
            } else {
                mainSubCategory.parent = kids._id;
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

        console.log('\nتم الانتهاء من إضافة أقسام الأطفال بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة أقسام الأطفال:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedKidsCategories();
