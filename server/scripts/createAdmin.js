require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};

const createSuperAdmin = async () => {
    try {
        console.log('\n=================================');
        console.log('Pathfinders Admin Setup Wizard');
        console.log('=================================\n');
        
       
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');
        
       
        const existingAdmin = await Admin.findOne({ role: 'super-admin' });
        if (existingAdmin) {
            console.log('⚠ Super admin already exists!');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            console.log('\nIf you forgot your password, please use the password reset feature.');
            
            const overwrite = await question('\nDo you want to create another super admin? (yes/no): ');
            if (overwrite.toLowerCase() !== 'yes') {
                console.log('\nSetup cancelled.');
                process.exit(0);
            }
        }
        
      
        console.log('Please provide the following information:\n');
        
        const fullName = await question('Full Name: ');
        if (!fullName) {
            throw new Error('Full name is required');
        }
        
        const username = await question('Username: ');
        if (!username) {
            throw new Error('Username is required');
        }
        
       
        const usernameExists = await Admin.findOne({ username });
        if (usernameExists) {
            throw new Error('Username already exists');
        }
        
        const email = await question('Email: ');
        if (!email) {
            throw new Error('Email is required');
        }
        
        
        const emailExists = await Admin.findOne({ email });
        if (emailExists) {
            throw new Error('Email already exists');
        }
        
        const password = await question('Password (min 8 characters): ');
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        const confirmPassword = await question('Confirm Password: ');
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        
        console.log('\nCreating super admin account...');
        const admin = await Admin.create({
            fullName,
            username,
            email,
            password,
            role: 'super-admin',
            isActive: true
        });
        
        console.log('\n✓ Super admin created successfully!\n');
        console.log('=================================');
        console.log('Admin Details:');
        console.log('=================================');
        console.log('ID:', admin._id);
        console.log('Full Name:', admin.fullName);
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('=================================\n');
        
        console.log('You can now login to the admin dashboard at:');
        console.log('http://localhost:8080/admin-login.html\n');
        console.log('IMPORTANT: Keep your credentials secure!\n');
        
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Error:', error.message);
        rl.close();
        process.exit(1);
    }
};


rl.on('close', () => {
    mongoose.disconnect();
});

createSuperAdmin();
