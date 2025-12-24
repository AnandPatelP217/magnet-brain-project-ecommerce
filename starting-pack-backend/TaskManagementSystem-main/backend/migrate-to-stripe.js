import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateToStripe = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Get current indexes
        const indexes = await ordersCollection.indexes();
        console.log('\nCurrent indexes:', indexes.map(idx => idx.name));

        // Drop old Razorpay indexes
        const razorpayIndexes = ['razorpayOrderId_1', 'razorpayPaymentId_1', 'razorpaySignature_1'];
        
        for (const indexName of razorpayIndexes) {
            try {
                await ordersCollection.dropIndex(indexName);
                console.log(`✓ Dropped index: ${indexName}`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`- Index ${indexName} doesn't exist (already dropped)`);
                } else {
                    console.log(`- Could not drop ${indexName}:`, error.message);
                }
            }
        }

        // Delete old orders with Razorpay data (optional - clean slate)
        console.log('\nCleaning up old orders...');
        const deleteResult = await ordersCollection.deleteMany({
            $or: [
                { razorpayOrderId: { $exists: true } },
                { razorpayPaymentId: { $exists: true } },
                { razorpaySignature: { $exists: true } }
            ]
        });
        console.log(`✓ Deleted ${deleteResult.deletedCount} old orders with Razorpay data`);

        // Create new Stripe indexes
        console.log('\nCreating new Stripe indexes...');
        
        try {
            await ordersCollection.createIndex({ stripePaymentIntentId: 1 }, { unique: true });
            console.log('✓ Created index: stripePaymentIntentId_1');
        } catch (error) {
            console.log('- stripePaymentIntentId index:', error.message);
        }

        try {
            await ordersCollection.createIndex({ stripePaymentMethodId: 1 }, { sparse: true });
            console.log('✓ Created index: stripePaymentMethodId_1');
        } catch (error) {
            console.log('- stripePaymentMethodId index:', error.message);
        }

        // Verify new indexes
        const newIndexes = await ordersCollection.indexes();
        console.log('\nFinal indexes:', newIndexes.map(idx => idx.name));

        console.log('\n✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateToStripe();
