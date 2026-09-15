require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/category.model');

const accessoriesCategories = [
    ['شنط', 'accessories-bags'],
    ['أحزمة', 'accessories-belts'],
    ['كوفيهات', 'accessories-scarves'],
    ['شارابات', 'accessories-socks']
];

async function seedAccessoriesCategories() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB Connected');

        // البحث عن قسم الإكسسوارات الرئيسي
        let accessories = await Category.findOne({
            slug: 'accessories'
        });

        // إن لم يكن موجودًا، يتم إنشاؤه
        if (!accessories) {
            accessories = await Category.create({
                name: 'إكسسوارات',
                slug: 'accessories',
                parent: null,
                isActive: true
            });

            console.log('تم إنشاء القسم الرئيسي: إكسسوارات');
        } else {
            console.log('القسم الرئيسي "إكسسوارات" موجود بالفعل');
        }

        // إنشاء الأقسام الفرعية وربطها بالإكسسوارات
        for (const [name, slug] of accessoriesCategories) {
            const exists = await Category.findOne({ slug });

            if (!exists) {
                await Category.create({
                    name,
                    slug,
                    parent: accessories._id,
                    isActive: true
                });

                console.log(`تم إنشاء القسم الفرعي: ${name}`);
            } else {
                exists.parent = accessories._id;
                await exists.save();

                console.log(`القسم الفرعي موجود بالفعل: ${name}`);
            }
        }

        console.log('\nتم الانتهاء من إضافة أقسام الإكسسوارات بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة أقسام الإكسسوارات:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedAccessoriesCategories();
